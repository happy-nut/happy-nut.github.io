---
title: Dockerfile 사용법
date: 2022-03-12
slug: "/devops/dockerfile"
tags:
  - 개발
  - 데브옵스
  - docker
  - dockerfile
---

Dockerfile에 대한 이해에 앞서, 먼저 예시부터 살펴볼까요? 다음은 간단한 Dockerfile 예시입니다.

```dockerfile:title=Dockerfile
FROM alpine

RUN apk and --update redis

CMD ["redis-server"]
```

Dockerfile 을 위와 같이 만들어서 `Dockerfile` 이라고 저장한 뒤,
같은 디렉토리 안에서 다음 명령어로 [Docker image](./docker)를 만들어 낼 수 있습니다.

```bash
docker build .
```

즉, Dockerfile 은 **Docker Image 를 만들어 내기 위한 설계도**라고 생각하시면 됩니다.
참고로, 명령어 맨 뒤의 `.`은 build context 라고 부르는데, 단순히 `Dockerfile` 이 저장되어 있는 디렉토리의 위치를 말합니다.

![](https://blog.kakaocdn.net/dn/cpHQsb/btqD2FXLMtq/kB8gkF36DSJAgC4RIX4GaK/img.png)

### Dockerfile이 이미지로 빌드되는 과정

이 `build` 커맨드는 매 명령어 라인 마다 임시 컨테이너(intermediate container) 이미지를 만듭니다. 아주 자세하게 그 과정을 들여다 보면 다음과 같습니다.

1. `alpine` 이라는 이미지를 도커 허브에서 다운받은 뒤 메모리에 떠 있는 컨테이너에 올린다.
2. 파일 시스템을 스냅샷을 찍어 로컬에 새로운 임시 컨테이너 이미지를 만든다.
3. 2 에서 만들었던 임시 컨테이너 이미지를 메모리에 올린 뒤, `apk and --update redis` 명령어를 실행한다.
4. 2 에서 만들었던 임시 컨테이너 이미지를 삭제하고 새로운 임시 컨테이너를 만들어 파일 시스템 스냅샷을 뜨고 저장한다.
5. 4 에서 만들었던 임시 컨테이너 이미지를 불러와 메모리에 올린 뒤 `redis-server`를 primary process command(startup command)로 지정한다.
6. 4 에서 만들었던 임시 컨테이너 이미지를 삭제하고 새로운 임시 컨테이너를 만들어 파일 시스템 스냅샷을 뜨고 저장한다.

> **Hint.** `alpine` 은 거추장스러운 모듈들을 다 떼어낸 최소 버전이라고 보시면 됩니다. `node`, `mysql` 같은 대부분의 공식 이미지들은 `alpine` 버전을 제공합니다.

만약 우리가 `Dockerfile` 을 수정하게 된다면, 도커는 이전 step에 대한 스냅샷을 찍어 캐싱을 하게 됩니다.
예를 들어, `RUN` 커맨드를 `CMD` 앞에 하나 더 추가한다고 하더라도 `docker build .`를 하게 되면 1~4 까지의 스탭은 스킵됩니다.
이를 통해 빌드 속도를 올릴 수 있다는 장점이 있습니다.


## Dockerfile 로 간단한 nodejs 앱 빌드하기

### 앱 생성

먼저 빌드할 `nodejs` 앱부터 만들어야겠습니다. `yarn init` 으로 적당히 `package.json` 을 만들고,
`index.js` 빈 파일을 생성합니다. 프로젝트 이름은 `docker_test`로 했습니다.

여기까지 디렉토리 구조는 다음과 같습니다.

```
❯ tree .
.
├── index.js
└── package.json
```

`index.js` 파일을 열어 아주 간단한 express hello world 앱을 작성했습니다.

```javascript:title=index.js
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
```

의존성이 추가되었으니, `package.json` 도 아래와 같이 수정해야 합니다.

```json
{
  "name": "docker_test",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "*"
  }
}
```

다음 명령어로 실행해보면 `localhost:3000` 에서 hello world 가 보입니다.

```bash
yarn && yarn start
```

### Dockerfile 작성

이제 `Dockerfile` 을 생성합니다. 이제부터 내용을 채우려고 하는데요.

우선은 [도커 허브](https://hub.docker.com/) 에서 쓸만한 이미지를 찾습니다. 여기서는 공식 `node` 이미지를 사용했습니다.
`pull` 받아서 실행을 한 번 해봅니다.

> Hint: `docker search node` 를 사용해서 원하는 이미지를 찾아도 됩니다.

```bash
docker pull node:alpine
docker run -it node:alpine sh
```

컨테이너 안에서 `yarn --version` 해보니 잘 나옵니다. `yarn` 이 설치돼 있다는 걸 확인했으니, 다음과 같이 `Dockerfile`을 작성해도 문제 없겠습니다.

```dockerfile:title=Dockerfile
FROM node:alpine

WORKDIR /usr/app

COPY ./ ./
RUN yarn install

CMD ["yarn", "start"]
```

### Docker 로 앱 빌드하여 실행하기

Dockerfile 을 만들었으니, 위에서 설명드렸던 `docker build .` 명령어를 가지고 이미지로 빌드해볼 수가 있습니다. 그런데 여기서 build 할 때 버전 태깅을 할 수도 있는데요,
태깅을 미리 해두면 나중에 찾기가 편합니다. 태깅은 다음 명령어 형식을 따릅니다.

```bash
docker build -t [docker ID]/[repo/project name]:[version | latest] .
```

여기서는 다음과 같이 태깅하여 빌드한 뒤, 실행합니다. 

```bash
docker build -t happynut/docker_test .
docker run -p 3000:3000 happynut/docker_test
```

좋습니다. 맨 처음 확인했던 것처럼 `localhost:3000` 에서 hello world 가 잘 보입니다.

### Dockerfile 최적화

앞서 매 스텝마다 `docker` 는 빌드 내역을 캐시한다고 했었습니다. 캐싱이 되면 빌드 속도가 매우 빨라지기 때문에 규모가 큰 프로젝트에선
이런 최적화의 중요성이 더 두드러집니다. 위에서 만들었던 `Dockerfile` 을 최적화 해봅시다.

위 스크립트에서 `RUN yarn install` 은 **가장 오래 걸리는 부분**입니다. `RUN yarn install` 을 포함하여, 그 보다 사전에 실행된
스텝에서 변경사항이 발생하는 경우 캐시는 더 이상 쓰지 못하고 무용지물이 되고 맙니다.

```dockerfile:title=Dockerfile {5}
FROM node:alpine

WORKDIR /usr/app

COPY ./package.json ./
RUN yarn install
COPY ./ ./

CMD ["yarn", "start"]
```

그러나 위와 같이 변경하였을 경우, `package.json` 을 건드리지 않고 소스코드만 수정한다면 `RUN yarn install` 까지의 과정이
캐시로 세이브되어 **install 과정이 스킵**됩니다. 실제 개발할 땐 package.json 보다 소스코드를 훨씬 더 자주 수정하게 되니 이런
디테일한 부분에 좀 더 신경을 써주면 좋을 것 같습니다.

## Docker hub 에 이미지 push 하기

`docker images` 로 현재 이미지들이 보여질 겁니다. 이미지 이름 형식이 `[docker ID]/[repo/project name]:[version | latest]` 여야 하는데,
이 때 `docker ID` 부분이 나의 Docker hub 계정 username 과 다르다면 access denied 되는 것에 주의해야 합니다.

이미지 이름이 `happynut/docker_test:latest` 라면, 다음 명령어로 푸시가 가능합니다.

```bash
docker push happynut/docker_test:latest
```
