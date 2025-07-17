# Java

대표적인 객체 지향 언어. [JVM(Java Virtual Machine)](jvm.md)에서 실행되며, 플랫폼 독립적인 특성을 가짐.


## java 프로그램 실행 과정

1. Java 소스파일(.java)을 javac 로 컴파일하여 .class 파일(바이트코드) 생성
2. ClassLoader 가 .class 파일을 로드
3. 링킹 & 초기화
4. main 메서드 실행

하나씩 살펴보자.

### 소스파일을 javac로 컴파일하여 바이트 코드 생성

다음과 같은 `Hello.java` 소스코드를 프로그래머가 작성했다.

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

이 파일을 `javac Hello.java` 명령어로 컴파일하면, `Hello.class` 파일이 같은 경로에 생성된다. 이 파일은 Java 바이트코드로, JVM에서 실행할 수 있는 형태이다.
원래라면 바이트코드라서 내용을 뜯어보기가 까다롭지만, 인텔리제이나 javap 같은 도구를 사용하면 바이트코드를 쉽게 확인할 수 있다.

```bash
// javap -c Hello.class
Compiled from "Hello.java"
public class Hello {
  public Hello();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public static void main(java.lang.String[]);
    Code:
       0: getstatic     #7                  // Field java/lang/System.out:Ljava/io/PrintStream;
       3: ldc           #13                 // String Hello World!
       5: invokevirtual #15                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
       8: return
}
```

실제로는 바이트코드가 무척 많이 나올 것이기 떄문에, jar 파일로 묶어서 배포하는 경우가 흔하다.
jar 파일은 Java Archive의 약자로, 여러 개의 .class 파일을 하나로 묶은 압축 파일이다.

## ClassLoader 가 .class 파일을 로드

JVM 은 `java` 명령어가 실행된 시점에 운영체제에 의해 띄워진다.

1. 새 프로세스 생성
2. 가상 주소 공간 할당
3. JVM 바이너리 로딩
4. JVM 힙 메모리 예약 (-Xmx 설정 만큼)
5. Method Area 예약
6. Stack 공간 예약

ClassLoader 는 세부적으로 나뉘어 있기도 하고 각자 하는 일도 다른데, .class 바이트 코드를 JVM이 이해할 수 있는 형태로 변환하는 역할을 한다.

필요하면 classpath 에서 .class 파일을 찾아 바이트 배열로 읽고, 이미 로드된 클래스는 다시 로드하지 않는다.
바이트 배열로 읽어들였다면 해당 데이터를 해석해서 JVM이 로드할 수 있게끔 `Class<?>` 객체를 반환한다.

```java
Class<?> clazz = defineClass(name, bytes, 0, bytes.length);
```

이렇게 로딩된 `clazz` 객체는 JVM이 관리하는 메모리 영역인 Method Area에 저장된다.

```java
InstanceKlass* klass = parseClassFile(bytes);      // 바이트코드 파싱
storeInMethodArea(klass);                          // Method Area에 저장(로딩)
return createJavaClassObject(klass);               // Class 객체 반환
```

## 링킹 & 초기화

ClassLoader 가 바이트 코드를 읽어 객체를 메모리에 로딩해주었다면, 링킹(Linking)과 초기화(Initialization)는 JVM이 담당한다.

무얼 연결하기에 링킹이라고 이름 붙여진 것일까. 그것은 Method Area 에 저장된 클래스 메타데이터와 실제 객체 인스턴스를 연결하는 과정이다.
예를 들어 `Hello` 라는 클래스가 `sayHello()` 라는 메서드를 가지고 있다면, 이 메서드가 가지는 실제 주소를 Method Area에 저장된 Hello 클래스의 메타데이터에 있는 심볼릭 링크를 대체한다.

즉 Class loading 이 끝난 후에는 Method Area 가 다음 상태라면,

```java
// Method Area에 저장된 Student 클래스
상수 풀:
├── #1 "java/lang/System"      // 이름만 알고 있음
├── #2 "out"                   // 이름만 알고 있음  
├── #3 "println"               // 이름만 알고 있음
└── #4 "(Ljava/lang/String;)V" // 시그니처만 알고 있음

바이트코드:
getstatic #2    // "System의 out 필드 가져와"
invokevirtual #3 // "println 메서드 호출해"
```

링킹은 실제 주소로 업데이트 된 Method Area 로 바뀌게 되고, 이를 통해 클래스의 메소드를 호출하는 것이 가능해진다.
바이너리 코드도 Method Area 에 저장되기 때문에 아래 주소들은 모두 Method Area 에 저장된 주소이다.

```java
상수 풀:
├── #1 → 0x7f8b1c001000       // System 클래스 실제 주소
├── #2 → offset 24            // out 필드 실제 위치
├── #3 → 0x7f8b1c002000       // println 메서드 실제 주소  
└── #4 → 0x7f8b1c003000       // 시그니처 실제 주소

바이트코드:
getstatic 24         // 24번째 바이트에서 가져와! (정확한 위치)
invokevirtual 0x7f8b1c002000 // 이 주소의 메서드 호출! (정확한 주소)
```

최초 Class loader 가 실제 주소를 바로 Method Area 에 저장하지 않는 이유는 알 수 없기 때문이다. 사용자가 만든 클래스를 모두 클래스 로딩하게 되면
한 번에 너무 많은 매모리를 사용하게 되는데 쓰이지 않는 라이브러리 클래스까지 전부 메모리에 로딩하게 되면 낭비가 생기므로, 런타임에 필요한 클래스들만 lazy loading 방식을 사용하게 된다.
그렇게 되면 클래스를 아직 로딩되지 않은 클래스의 주소를 알 수 없으므로 심볼릭 링크를 거는 것이다. 

만약 링킹을 끝마치고 나면 초기화를 해야 하는데, 초기화 역시 실제로 사용되는 시점에 실행된다.
이 때 static 변수들은 Method Area 에 저장되지만, static 변수가 담고 있는 객체(ArrayList 같은)들은 Heap 영역에 저장된다.

- static 변수에 실제 값 할당
- static 블록 실행
- static final 변수 중 런타임 계산이 필요한 것들 실행

## Main 메서드 실행

이 단계에서 수많은 최적화가 이루어지며 인터프리터와 JIT 컴파일러가 바이트 코드를 실행하는 단계이다.
인터프리터는 java의 .class 바이트 코드를 한 줄 씩 읽어 거기에 해당되는 적절한 (JVM의 C++) 코드를 실행하는 것이라면 JIT 컴파일러는 어셈블리어로 컴파일을 해둔다.

Hotspot JVM 에서는 기본적으로 인터프리터가 바이트 코드를 실행하고, 자주 호출되는 메서드나 루프는 JIT(Just-In-Time) 컴파일러에 의해 어셈블리어로 컴파일 되어 실행된다.
이 과정에서 인라인, 루프 최적화, 코드 캐시 등등 다양한 최적화 메커니즘이 적용된다.

