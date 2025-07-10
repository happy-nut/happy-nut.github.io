# 공변성과 반공변성

공변이라 함은 함께(공) 변한다(변)를 의미한다.
무엇이 함께 변하느냐? 바로 계층 구조이다.

예를 들어,
`Dog` 는 `Animal`의 하위 타입이다.
그리고 `List<Dog>`는 `List<Animal>`의 하위 타입처럼 보일 수 있지만, Java에서는 그렇지 않다.
왜냐하면 제네릭 타입`List<T>`은 기본적으로 불공변이기 때문이다. 

하지만 제네릭 타입을 읽기만 하는 경우라면 이야기가 달라진다.

```java
List<? extends Animal> animals = new ArrayList<Dog>();
Animal a = animals.get(0);
Dog d = animals.get(0); // 컴파일 에러! 최소한 Animal 이라는 타입인지만 보장하므로 Dog 인지는 모름
animals.add(new Cat()); // 컴파일 에러!
animals.add(new Animal()); // 컴파일 에러! 실제론 Dog 나 Cat 일 수도 있으므로.
```

위 예제에서 `animals` 는 `List<Dog>`, `List<Cat>`, `List<Bird>` 등을 모두 함께 받을 수 있다.
즉, 제네릭 타입 간에 마치 클래스 계층 구조처럼 함께 변하는(공변) 효과가 생겨버린 것이다.

반대로, 반공변성은 계층 구조가 역방향으로 움직이는 것을 의미한다.

```java
List<? super Dog> dogs = new ArrayList<Animal>();
dogs.add(new Dog());       // Dog는 안전하게 추가 가능
dogs.add(new Poodle());    // Poodle도 가능 (Dog의 하위 타입)

Object obj = dogs.get(0);  // 반환 타입은 Object로만 안전하게 추론됨
Animal a = dogs.get(0);    // 컴파일 에러! Animal 은 Dog 의 상위 타입이긴 하나, 정말 Object가 들어갔을 수도 있기 때문. 
Dog d = dogs.get(0);       // 컴파일 에러!
```

`dogs`는 최소한 `Dog`를 담을 수 있는 그릇이기 때문에 `add(new Dog())` 는 항상 안전하다.
그러나 `dogs` 에는 공변성과는 반대로 `List<Poodle>` 같은 걸 담을 수 없다.
즉, 계층 구조가 역방향(반)으로 함께(공) 변하는(변) 효과가 생긴 것이다.


## PECS 원칙

어느 때나 공변과 반공변을 섞어 쓰는 것은 아니고, PECS(Producer-Extends, Consumer-Super) 원칙을 따라야 한다.

- Producer -> 제네릭 타입을 뱉어내어 생산하는 경우 -> `extends` 사용
- Consumer -> 제네릭 타입을 빨아들여 소비하는 경우 -> `super` 사용

잘 와닿지 않는데, input과 output이 있는 함수를 떠올리면 쉽다.

```java
Function<Integer, String> function;
``` 

제네릭 타입을 활용해 함수를 만든다고 생각하면 여러 타입으로 코드를 재사용할 수 있게 되는데,
함수 입장에서 Integer 보다 더 넓은 타입을 소비하면서 최소한 String과 같거나 하위 타입임을 보장하도록 한다면 코드는 다음과 같다. 

```java
Function<? super Integer, ? extends String> function;
```

이걸 조금 더 일반화 한다면 java의 `map()`의 `mapper` 와 비슷한 형태가 된다.

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper);
```
