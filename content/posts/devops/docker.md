---
title: Docker 사용법
date: 2022-03-11
slug: "/docker"
tags:
  - 개발
  - devops
---

![Docker](./docker_1.png)

### 왜 사용하는가?

'왜' 라는 단어는 무언갈 학습하는 데 있어서 이 질문이 간결한 만큼이나 중요합니다. 열정 가득한 우리는 항상 이 의문을 던질 준비가 되어 있어야 하죠.
우리는 왜 도커를 사용해야 할까요? 도커는 **소프트웨어의 설치나 실행을 매우 간결하게 만들어 주기 때문**입니다. 도커를 사용하면 소프트웨어가
의존하고 있는 디펜던시 라이브러리나, 셋업하는 과정에 대해 걱정할 필요가 없어집니다.

### 이미지와 컨테이너

도커는 컨테이너를 실행하기 위한 플랫폼입니다.
어떤 프로그램을 실행하는 데 있어서 필요한 의존성이나, 설정과 같은 부분들을 **이미지화(dockerizing)** 하여
허브에다가 올려놓으면 우리는 그 이미지의 인스턴스를 쉽게 따온 뒤에 의존성이나 설정에 대한 염려 없이 곧바로 프로그램을 실행할 수 있습니다.
이 이미지 인스턴스를 우리는 **컨테이너**라고 부릅니다.

### 컨테이너: 이미지 인스턴스

컨테이너는 이미지로부터 어떻게 인스턴스화 되는 걸까요? 이미지화 되는 과정을 차근차근 살펴보면, 크게 다음 2가지 일이 일어납니다.

1. 프로그램을 위한 deps(의존성) 들의 Snapshot(File system snapshot) 생성
2. 해당 프로그램을 실행시키기 위한 startup command 세팅

`docker run` 같은 명령어로 이미지를 로컬에 가져오게 되면, 이미지에 떠져있는 snapshot이 내 머신에 풀어지고,
startup command가 실행되면서 프로세스를 생성합니다. 이 프로세스는 `namespace` 가 같은 자원, 즉 아까 풀어졌던 snapshot만
바라보기 때문에, 머신에 이미 설치되어 있던 다른 deps들과 충돌할 일이 없습니다. 이를 **프로세스 네임스페이싱**이라고 합니다.

### docker 명령어

명령어는 [Docker 다큐먼트](https://docs.docker.com/engine/reference/commandline/docker/) 에서 찾아볼 수 있습니다. 그러나 너무 많으니,
간단하면서도 많이 사용되는 명령어 위주로 살펴보겠습니다.

#### 컨테이너 목록 보기

아래 명령어로 컨테이너 목록에서 컨테이너의 ID, 이름, 상태 등을 조회할 수 있습니다.

```bash
docker ps -a
```

#### 컨테이너 만들기

`docker run` 명령어를 쓰면 되는데, 옵션이 좀 많습니다.

```bash
docker run -e MY_ENV="a=b" -v ~/my/dir/:/container/dir [IMAGE]:[TAG]
```

- v (volume): 호스트의 볼륨과 컨테이너 내의 이미지를 매핑시킵니다.
- d (deamon): 데몬으로 실행시킵니다.
- e (environment): 환경변수를 지정합니다.

#### 컨테이너 실행하기

컨테이너를 실행하려면 컨테이너가 이미 만들어져 있어야 합니다. 아래 명령어로 다운되어 있는 컨테이너를 UP 상태로 변경할 수 있습니다.

```bash
docker start
```

켜진 컨테이너에 접속하거나 명령을 내리고 싶으면 [`exec`](https://docs.docker.com/engine/reference/commandline/exec/) 를 사용합니다.

```bash
docker exec -it b80353d7e482 /bin/bash
```

여기에 쓰인 옵션은 다음과 같습니다.

- i (interactive): 인터렉티브 모드로 도커를 실행시킵니다.
- t (tts): pseudo-TTY 를 할당합니다.
- d (detach): 명령어를 Background 에서 실행시킵니다.

#### 컨테이너 삭제하기

삭제는 다음 명령어를 사용합니다.

```bash
docker rm [CONTAINER_ID]
```

도커 쓰다보면 안쓰지만 `docker ps -a` 에 계속 잡히는 애들이 있는데, 주로 exited 되고 난 이후 안 쓰이는 애들입니다.
한꺼번에 삭제하려면 다음 명령어를 사용합니다.

```bash
docker rm $(docker ps -a -q -f status=exited)
```

#### Container 로, 혹은 Container 로부터 파일 복사하기

Host에서 Container로 파일(혹은 디렉토리)를 옮기고 싶은 경우:

```bash
docker cp [hostFilePath] [container_name]:[containerPath]
```

Container에서 Host로 파일을 옮기고 싶은 경우:

```bash
docker cp [container_name]:[containerPath] [hostFilePath]
```

참고로, copy는 container가 running상태가 아니어도 가능합니다.

### Conclusion

여기까지 도커에 대해 알아보았습니다. 
