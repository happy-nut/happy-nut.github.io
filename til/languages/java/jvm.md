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
클래스가 메모리에 로드될 때 생성되며, GC가 돌면서 클래스를 수거하게 되면 Method Area 에 저장되었던 메타데이터들도 함께 삭제된다.


## Heap

Heap 은 객체 인스턴스와 배열을 저장하는 영역으로, 런타임에 동적으로 할당된다.

크게 2가지 영역으로 나뉜다.
  
### Young Generation

Young Generation 은 새로 생성된 객체가 저장되는 영역으로, 대부분의 객체는 이 영역에서 생성된다.
크게 2가지로 나뉜다. Eden Space 와 Survivor Space 이다.

새로 객체가 생성되면 Eden Space 에 저장되고, GC가 돌면서 살아남은 객체는 Survivor Space 로 이동한다.
Survivor Space 는 S0, S1 두 개의 영역으로 나뉘며, GC가 돌 때마다 살아남은 객체는 S0에서 S1로, S1에서 S0로 이동한다.

### Old Generation

Old Generation 은 Young Generation에서 살아남은 객체가 저장되는 영역이다.
혹은 너무 큰 객체가 생성될 때도 Old Generation에 저장된다.

## Stack

Stack 은 각 스레드마다 존재하며, 메서드 호출 시 생성되는 프레임을 저장한다.

## PC Register

PC Register 는 현재 실행 중인 JVM 명령어의 주소를 저장하는 레지스터이다.

## Native Method Stack

Native Method Stack 은 Java 외부에서 호출되는 네이티브 메서드의 정보를 저장하는 영역이다.

