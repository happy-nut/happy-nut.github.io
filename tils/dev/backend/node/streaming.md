# node-streaming

![](https://miro.medium.com/max/2560/0*_SqeFlB5GKD861m9)

## 스트리밍을 왜 사용하는가

아래 예제에서는 요청에 대한 응답으로 `big.file`을 내려준다.

```javascript
const fs = require("fs")
const server = require("http").createServer()

server.on("request", (req, res) => {
  fs.readFile("./big.file", (err, data) => {
    if (err) throw err

    res.end(data)
  })
})

server.listen(8000)
```

`big.file` 이 매우 크다면 노드의 이벤트 루프를 응답을 내려주는 시간동안 차단하므로 별로 좋지 못한 상황이 발생할 것이다.
실제로 서버를 실행시킨 뒤 `curl localhost:8000` 을 날리면 할당된 메모리가 파일 크기 만큼 증가해버린다.

그러나 아래와 같이 읽기 전용 스트림을 열어주게 되면, 메모리가 청크 단위로밖에 늘어나지 않아 효율적이다.

```javascript
const fs = require("fs")
const server = require("http").createServer()

server.on("request", (req, res) => {
  const src = fs.createReadStream("./big.file")
  src.pipe(res)
})

server.listen(8000)
```

## Node.js 기초 스트림 타입

* Readable: 소비할 수 있는 데이터를 추상화. 예: `fs.createReadStream`
* Writable: 데이터를 기록할 수 있는 종착점을 추상화. 예: `fs.createWriteStream`
* Duplex: 읽기/쓰기 모두 가능. 예: `TCP 소켓`
* Transform: 기본적으로 Duplex 스티림이나, 데이터를 읽거나 기록할 때 수정/변환할 수 있다. 예: `zlib.createGzip`

모든 스트림은 EventEmitter의 인스턴스다. 즉, 데이터를 읽거나 쓸 때 사용할 이벤트를 방출한다.
하지만, `pipe` 메소드를 이용하면 더 간단하게 스트림 데이터를 이용할 수 있다.

## `pipe` 메소드

아래 코드는 Readable 스트림의 출력과 Writable 스티림의 입력을 파이프로 연결한다.

```javascript
readableSrc.pipe(writableDest)
```

아래 코드는 파이프 체인을 호출할 수 있다.

```javascript
reableSrc
  .pipe(transformStream1)
  .pipe(transformStream2)
  .pipe(finalWritableDest)
```

파이프 체인은 리눅스에서 자주 보인다. 리눅스에서 쓰이는 파이프 `$ a | b | c | d` 는 아래와 같이 코드로 표현될 수 있다.

```javascript
a
  .pipe(b)
  .pipe(c)
  .pipe(d)
```

## 스트림 이벤트

스트림은 직접 이벤트와 함께 사용할수 있다. `pipe` 가 해주는 일을 스트림 이벤트로 표현하면 다음과 같다.

```javascript
// readable.pipe(writable)

readable.on("data", chunk => {
  writable.write(chunk)
})

readable.on("end", () => {
  writable.end()
})
```

Readable 스트림의 스트림 이벤트:

* `data` 이벤트: 스트림이 컨슈머에게 data chuck를 전송할 때 발생
* `end` 이벤트: 더 이상 컨슘할 데이터가 없을 때 발생
* 이 밖의 이벤트들: `error`, `close`, `readable`

Writable 스트림의 스트림 이벤트:

* `drain` 이벤트: Writable 스트림이 더 많은 데이터를 수신할 수 있다는 신호
* `finish` 이벤트: 모든 데이터가 시스템으로 flush 될 때 생성

## Writable Stream 만들기

```javascript
const { Writable } = require("stream")

const outStream = new Writable({
  write(chunk, encoding, callback) { // 스트림의 첫 번째 인자(chuck) 는 보통 버퍼.
    console.log(chunk.toString())
    callback()
  },
})

process.stdin.pipe(outStream)
```

위 코드는 내가 입력한 내용을 그대로 콘솔에 출력할 것이다. 사실 이 코드는 아래 코드를 풀어 쓴 것이다.

```javascript
process.stdin.pipe(process.stdout)
```

## Readable Stream 만들기

아래 코드는 알파벳이 `A` ~ `Z`까지 차례로 출력되는 스트림이다.

```javascript
const inStream = new Readable({
  read(size) { // On demand 로 동작: 누군가 이것을 읽으려고 할 때만.
    this.push(String.fromCharCode(this.currentCharCode++)) // 스트림에 내보낸다.
    if (this.currentCharCode > 90) {
      this.push(null) // 더 이상 보낼 데이터가 없다는 뜻.
    }
  }
})

inStream.currentCharCode = 65

inStream.pipe(process.stdout)
```

## Duplex Stream 만들기

duplex 는 양방향 통신이 가능하다. 때문에 `read` 와 `write`를 모두 구현한다.

```javascript
const { Duplex } = require("stream")

const inoutStream = new Duplex({
  write(chunk, encoding, callback) {
    console.log(chunk.toString())
    callback()
  },

  read(size) {
    this.push(String.fromCharCode(this.currentCharCode++))

    if (this.currentCharCode > 90) {
      this.push(null)
    }
  },
})

inoutStream.currentCharCode = 65

process.stdin.pipe(inoutStream).pipe(process.stdout)
```

위 코드는 STDIN 으로 입력된 데이터가 `inoutStream`의 `write`에 들어간다. 그 와중에 알파벳도 같이 출력된다.
이렇듯 Duplex 는 읽기/쓰기가 완전히 독립적으로 동작한다.

## Transform Stream 만들기

Transform 은 `map` function 같은 느낌이다.

```javascript
const { Transform } = require("stream")

const upperCaseTr = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  },
})

process.stdin.pipe(upperCaseTr).pipe(process.stdout)
```

위 코드는 STDIN으로 입력된 글자가 전부 upper case 로 변환되어 콘솔에 출력된다.

## Stream object 모드

일반적으로 스트림은 data chunk 로 버퍼와 문자열 값을 기대한다. 그러나 `objectMode` 플래그를 사용하면 자바스크립트 객체를 허용할 수 있다.
즉, 데이터 인코딩 문제로부터 벗어나 로직에 집중할 수 있다.

```javascript
const { Transform } = require("stream")

const commaSplitter = new Transform({
  readableObjectMode: true,

  transform(chunk, encoding, callback) {
    this.push(chunk.toString().trim().split(","))
    callback()
  },
})

const arrayToObject = new Transform({
  readableObjectMode: true, // 배열을 받기 때문에 플래그 추가했음.
  writableObjectMode: true, // 객체를 뱉을 거라 플래그 추가했음.

  transform(chunk, encoding, callback) {
    const obj = {}
    for (let i = 0; i < chunk.length; i += 2) {
      obj[chunk[i]] = chunk[i + 1]
    }
    this.push(obj)
    callback()
  },
})

const objectToString = new Transform({
  writableObjectMode: true,

  transform(chunk, encoding, callback) {
    this.push(JSON.stringify(chunk) + "\n")
    callback()
  },
})

process.stdin
  .pipe(commaSplitter)
  .pipe(arrayToObject)
  .pipe(objectToString)
  .pipe(process.stdout)
```

위 코드는 여러 파이프를 지나, `"a,b,c,d"`가 `{ "a":"b", "c": "d"}`로 바뀌는 스트림을 보여준다.


## Streaming 에서 에러 처리

```javascript
rootStream
  .pipe(streamA)
  .pipe(streamB)
  .pipe(streamC)
```

코드가 위와 같다고 할 때, `streamC` 에서 에러가 난다면 스트림이 배출될 곳이 터져버린 것이므로 당연히 에러는 거슬러 올라가
`rootStream` 한테까지 전파가 될 거라고 생각하기 쉽다.

```javascript
rootStream
  .pipe(streamA)
  .pipe(streamB)
  .pipe(streamC)

rootStream.on('error', () => {
  console.log('rootStream error occurred!')
})

streamA.on('error', () => {
  console.log('steamA error occurred!')
})

streamB.on('error', () => {
  console.log('streamB error occurred!')
})

streamC.on('error', () => {
  console.log('streamC error occurred!')
})
```

`.pipe` 는 에러를 위로 전파하도록 설계되지 않았다. 즉 `streamC`에서 `'error'` 이벤트가 발생한다면
오직 `'streamC error occurred!'` 라는 결과만 얻는다.

```javascript
streamC.on('error', (error) => {
  console.log('streamC error occurred!')
  streamC.destroy(error)
})

// Result:
// 'streamC error occurred!'
// 'streamC error occurred!'
```

`.destroy(error)` 역시 상위 스트림으로 에러를 전파하지 않는다. 다만 `error` 를 함께 전파했으므로 핸들러를 한 번 더 호출할 뿐이다.
흥미로운 점은 핸들러가 다시 호출되어 `error`를 다시 싣고서 `destory`가 호출되었는데로 무한 루프가 생기지 않는다는 점이다.

만약 스트림에서 에러가 발생하는 경우 모든 스트림을 닫아야 한다면, 다음과 같이 `handleError`를 만드는 편이 좋다.

```javascript
const handleError = (error) => {
  console.log(error)
  rootStream.destroy()
  streamA.destroy()
  streamB.destroy()
  streamC.destroy()
}

rootStream.on('error', handleError)
streamA.on('error', handleError)
streamB.on('error', handleError)
streamC.on('error', handleError)
```

반면 `event` 가 발생하는 경우가 아니라 아예 런타임에 스트림을 처리하면서 에러를 `throw` 할 수도 있다. 

```javascript
const streamC = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk)
    throw new Error('Runtime Error!')
  },
})
```

결과는 처참하다.

```
...
    throw new Error('Runtime Error!')
    ^

Error: Runtime Error!
    at Transform.transform [as _transform] (/Users/hyungsun/test/streamTest.js:22:11)
    at Transform._read (_stream_transform.js:191:10)
...
```

위 결과에서 알 수 있듯이, 아예 프로그램이 뻗어버린다.
즉 `transform` 안에서 error가 발생할 것 같으면, try-catch 로 감싸 `stream.emit('error', error)` 를 이용해 처리하는 것이 바랍직하다.

## (node v10 이상) Streaming 에서 에러 처리

node v10 이상에서는 `pipeline` 과 `finished`라는 유틸이 소개되었다.

```javascript
const { pipeline, finished } = require("stream")

pipeline(
  rootStream,
  streamA,
  streamB,
  streamC,
  (err) => {
    console.log('error: ', err)
  }
)

finished(rootStream, (err) => {
  console.log('error:', err)
})
```

위와 같이 `pipeline`을 통해 하위 스트림에서 발생하는 에러를 한꺼번에 핸들링할 수 있을 뿐만이 아니라,
`finished` 로 지정한 스트림이 끝나기 전에 에러가 발생하는 경우 에러 핸들러를 호출할 수 있다.

혹은, 좀 더 정교한 핸들링이나 파이핑을 원한다면 RxJs 사용을 고려해볼 수도 있겠다.
