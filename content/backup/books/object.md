# 오브젝트: 코드로 이해하는 객체지향 설계

저자 조영호

## 14. 일관성 있는 협력

### 두 가지 지침

협력은 일관성이 있어야 한다. 그 이유는 협력을 재사용 하기 위해서다. 협력을 일관성 있게 만들기 위해서는 변경을 캡슐화 해서 파급효과를 줄여야 한다. 
이 때 다음 두 가지 지침을 유의하면 좋다.

* 변하는 개념을 변하지 않는 개념으로부터 분리하라.
* 변하는 개념을 캡슐화하라.

위 지침을 지켜야 나중에 바뀌지 않는 부분에는 영향을 미치지 않는 채로 변경사항을 수용할 수 있다.

### 캡슐화

설계에서 무엇이 변화할 수 있는 지 고려하여 변하는 부분과 변하지 않는 부분들을 구분한 뒤, 변하는 부분들의 공통점을 뽑아내 추상화 하고 변하지 않는 부분이
이 추상화에 의존하도록 하면 변경을 캡슐화 할 수 있게 된다.
여기서 캡슐화는 단순한 데이터 은닉만을 이야기 하는 것이 아니라 소프트웨어에서 변할 수 있는 어떠한 '개념'이라도 감추는 것을 이야기 한다.

* 데이터 캡슐화: 클래스 내부에서 관리하는 데이터를 캡슐화
* 메서드 캡슐화: 클래스의 내부 행동을 캡슐화
* 객체 캡슐화: 객체와 객체 사이의 관계를 캡슐화(합성 - 변하지 않는 부분의 일부로 타입 계층을 합성한다. 변하지 않는 부분은 변하는 부분의 구체적인 종류에 대해 알지 못한다.)
* 서브타입 캡슐화: 서브타입의 종류를 캡슐화(다형성의 기반, 인터페이스 상속 - 변하는 부분을 분리해서 타입 계층(추상 클래스나 인터페이스)을 만든다. 즉, 변하는 부분은 변하지 않는 부분의 서브타입이 된다.)

### 변경 분리하고 캡슐화하여 구현하기

요구사항 분석을 통해 변하는 것(e.g. 핸드폰 요금 적용 조건)과 변하지 않는 것(e.g. 요금 정책은 요금 적용 조건을 포함한다)을 찾아낸다. 변하지 않는 요소와
추상적인 요소 만으로도 전체적인 협력 구조를 설명할 수 있어야 한다. 변하는 것은 추상화 뒤에 캡슐화되어 숨겨져 있기 때문에 전체적인 협력 구조에 영향을 미치지
않기 때문이다.

처음에는 일관성을 유지하는 것처럼 보이던 협력 패턴이 시간이 흐르면서 새로운요구사항이 추가되는 과정에서 일관성이 금이 가는 경우를 자주 목도하게 된다. 이건
처음부터 모든 변경사항을 예측할 수 없기 때문에 자연스러운 일이고, 오히려 새로운 요구사항을 수용할 수 있는 협력 패턴을 향해 설게를 진화시킬 수 있는 좋은 신호로
받아들여야 한다. 협력은 고정된 것이 아니다. 만약 현재의 협력 패턴이 변경의 무게를 지탱하기 어렵다면 과감하게 새로운 협력패턴을 향해 리팩토링할 수 있어야 한다.

## 15. 디자인 패턴과 프레임워크

디자인 패턴이 설계를 재사용하기 위한 것이라면 프레임 워크는 설계와 코드를 함께 재사용하기 위한 것이다.

## 캡슐화와 디자인 패턴

### 디자인 패턴

대부분의 디자인 패턴은 협력을 일관성 있고 유연하게 만드는 것을 목적으로 하는데, 이를 위해 각각 특정한 변경을 캡슐화하기 위한 독자적인 방법을 정의한다.

합성을 통해 변경을 캡슐화하는 패턴은 Strategy 패턴, 상속을 통해 변경을 캡슐화하는 패턴은 Template method 패턴인 것처럼 말이다. Template method 패턴은
다만 합성보다는 결합도가 높은 상속을 사용했기 때문에 Strategy 패턴처럼 런타임에 알고리즘을 변경하는 것은 불가능하다. 하지만 알고리즘 교체와 같은 요구사항이
없다면 상대적으로 Strategy 패턴보다 복잡도를 낮출 수 있다는 면에서는 장점이라고 할 수 있다.

Decorator 패턴은 객체의 행동을 동적으로 추가할 수 있게 해주는 패턴으로, 기본적으로 객체의 행동을 결합하기 위해 객체 합성을 사용한다. 즉, 선택적인 행동의
개수와 순서에 대한 변경을 캡슐화할 수 있다.

하지만 패턴은 만능이 아니다. 일단, 패턴은 복잡하다. 따라서 복잡성의 가치가 단순성을 넘어설 때만 정당화되어야 한다. 

### 프레임워크

프레임워크란 추상 클래스나 인터페이스를 정의하고 인스턴스 사이의 상호작용을 통해 시스템 전체 혹은 일부를 구현해 놓은 재사용 가능한 설계, 또는 애플리케이션
개발자가 현재의 요구사항에 맞게 커스터마이징할 수 있는 애플리케이션의 골격을 의미한다.

프레임워크는 소프트웨어를 상위 정책과 하위 정책으로 나누어, 상위 정책을 별도 패키지로 묶은 후 안정적이고 성숙하게 되면 별도의 배포 단위로 만들어 구현해 낼 수 있다. 
상위 정책을 재사용한다는 것은 결국 도메인에 존재하는 핵심 개념들 사이의 협력 관계를 재사용한다는 것을 의미한다. 그러기 위해서는 의존성 역전 원리가 뒷받침 되어야 한다.

시스템이 진화하는 방향에는 항상 의존성 역전 원리를 따르는 설계가 존재해야 한다. 만약 요구사항이 빠르게 진화하는 코드에서 의존성 역전 원리가 적절하게 지켜지지 않고
있다면 그곳에는 변경을 적절하게 수용할 수 없는 하향식의 절차적인 코드가 존재할 수 밖에 없다.

협력을 제어하는 쪽은 프레임워크지, 우리의 코드가 아니다. 제어가 역전된 것이다. 라이브러리라면 우리가 코드를 호출하겠지만 프레임워크 위에서는 우리의 코드는 수동적인
존재가 된다. 그러나 이러한 수동성이 코드의 재사용을 부른다는 것을 이해해야 한다.

## 부록 A. 계약에 의한 설계

## 부록 B. 타입 계층의 구현

## 부록 C. 동적인 협력, 정적인 코드
