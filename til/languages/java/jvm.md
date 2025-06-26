# Java Virtual Machine (JVM)

JVM은 Java 프로그램을 실행하기 위한 가상 머신으로, Java 바이트코드를 실행할 수 있는 환경을 제공함.
C++ 로 구현되어 있다.

## HotSpot vs Graal

JVM의 구현체 중 가장 널리 사용되는 것은 HotSpot 이고, GraalVM 이라는 새로운 JVM 구현체도 있다.
GraalVM은 마이크로 서비스 아키텍처에 적합한 성능을 제공하는 것으로 알려져 있다.

세부 적으로 어떤 차이가 있는지는 TBD.

## JVM Memory Structure

- Method Area
- Heap
- Stack
- PC Register
- Native Method Stack

하나씩 살펴보자.

## Method Area(Metaspace)

Method Area 는 클래스 메타데이터, 상수, 정적 변수 등을 저장하는 영역이고, JVM이 시작될 때 Method Area의 크기가 고정된다.
클래스가 메모리에 로드될 때 생성되며, [GC](garbage-collector.md)가 돌면서 클래스를 수거하게 되면 Method Area 에 저장되었던 메타데이터들도 함께 삭제된다.

## Heap

Heap 은 객체 인스턴스와 배열을 저장하는 영역으로, 런타임에 동적으로 할당된다.

크게 2가지 영역으로 나뉘는데, 이 부분에 대한 설명은 [Garbage Collector](garbage-collector.md) 를 참고하자.

## Stack

Stack 은 각 스레드마다 존재하며, 메서드 호출 시 생성되는 스택 프레임을 저장한다.

## PC(Program Counter) Register

PC Register 는 현재 실행 중인 JVM 명령어의 주소를 저장하는 레지스터이다. JVM은 가상머신(Virtual Machine)이므로 bytecode 를 실행하는 가상의 프로세서라고 보면 되는데, 
CPU에게 PC register 가 필요하듯이 JVM에게도 스레드 별로 PC register 가 필요해서 만들어진 공간이다.

## Native Method Stack

Native Method Stack 은 Java 외부에서 호출되는 네이티브 메서드(Native method)의 정보를 저장하는 영역이다.
Native method 는 Java가 아닌 C/C++ 등으로 작성된 메서드를 의미하는데, Java 표준 라이브러리 자체가 많은 native method 를 포함하고 있다.
`System.currentTimeMillis()`, `Object.hashCode()`, `Thread.sleep()` 등은 내부적으로 native method 를 호출하므로 intellij 에서 구현체를 들여다 보면 아래와 같이 native 키워드가 붙은 것을 볼 수 있다. 

```java
@IntrinsicCandidate
public static native long currentTimeMillis();
```
