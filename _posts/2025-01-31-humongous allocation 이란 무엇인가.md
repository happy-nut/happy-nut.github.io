---
title: Humongous allocation 이란 무엇인가
description: "큰 객체는 GC도 다르게 다룬다."
date: 2025-01-31 10:14:50 +0900
categories: [JVM, Garbage Collection]
tags: [java, jvm, gc, g1gc, cms]
mermaid: true
math: false
---


## CMS GC의 이해와 한계

CMS(Concurrent Mark-Sweep) GC는 애플리케이션의 응답 시간을 개선하기 위해 Stop-The-World(STW) 시간을 최소화하는 데 중점을 둔 가비지 컬렉터다.
STW는 가비지 컬렉션을 수행하기 위해 JVM이 애플리케이션의 실행을 잠시 멈추는 현상을 말한다.

### CMS GC 프로세스

STW 가 발생하는 단계는 붉은색으로 표기했다.

```mermaid
flowchart LR
    %% Initial Mark Phase
    subgraph Phase1[Initial Mark Phase STW]
        direction TB
        IM1[GC 루트 스캔] --> IM2[Class Loader]
        IM1 --> IM3[Thread Stack]
        IM1 --> IM4[JNI References]
        IM2 --> IMR[직접 참조된<br>객체만 마킹]
        IM3 --> IMR
        IM4 --> IMR
    end

    %% Concurrent Mark Phase
    subgraph Phase2[Concurrent Mark Phase]
        direction TB
        CM1[마킹된 객체에서<br>참조 추적] --> CM2{순환 참조<br>확인}
        CM2 -->|있음| CM3[순환 참조<br>객체 마킹]
        CM2 -->|없음| CM4[다음 객체<br>이동]
        CM3 --> CM5[참조 카운트<br>업데이트]
        CM4 --> CM5
    end

    %% Remark Phase
    subgraph Phase3[Remark Phase STW]
        direction TB
        RM1[tri-color 마킹] --> RM2{객체 변경<br>확인}
        RM2 -->|변경됨| RM3[재마킹]
        RM2 -->|변경없음| RM4[마킹 완료]
        RM3 --> RM5[카드 테이블<br>업데이트]
        RM4 --> RM5
    end

    %% Concurrent Sweep Phase
    subgraph Phase4[Concurrent Sweep]
        direction TB
        SW1[미사용 객체<br>식별] --> SW2{메모리 해제}
        SW2 -->|회수| SW3[메모리 풀<br>반환]
        SW2 -->|보존| SW4[다음 객체<br>검사]
        SW3 --> SW5[Free List<br>업데이트]
        SW4 --> SW5
    end

    %% Phase connections with memory state
    Phase1 -->|앱 실행 재개<br>일부 객체 마킹| Phase2
    Phase2 -->|STW 시작<br>참조 객체 마킹 완료| Phase3
    Phase3 -->|앱 실행 재개<br>최종 마킹 상태| Phase4
    
    %% Memory state indicators
    MS1[힙 메모리<br>초기 상태] -->|객체 마킹| Phase1
    Phase4 -->|단편화 발생| MS2[힙 메모리<br>최종 상태]

    classDef stw fill:#f9d5e5,stroke:#333,stroke-width:2px
    classDef concurrent fill:#e3f2fd,stroke:#333,stroke-width:2px
    classDef memory fill:#fff3e0,stroke:#333,stroke-width:2px
    class Phase1,Phase3 stw
    class Phase2,Phase4 concurrent
    class MS1,MS2 memory
```

### CMS GC의 작동 방식
CMS는 다음과 같은 주요 단계를 거쳐 동작한다:

1. Initial Mark (STW 발생)
2. Concurrent Mark
3. Remark (STW 발생)
4. Concurrent Sweep

이 중에서 Initial Mark와 Remark 단계에서만 STW가 발생하며, 객체를 정리하는 Sweep 작업은 애플리케이션 실행과 동시에 수행된다. 이것이 "Concurrent" Mark-Sweep이라는 이름의 유래다.

### CMS GC의 한계점

CMS GC는 다음과 같은 주요 한계점을 가진다:

1. 메모리 단편화(Memory Fragmentation): 단순히 객체를 제거만 하고 끝내기 때문에, 메모리에 불연속적인 빈 공간이 생성되어 새로운 객체 할당이 실패할 수 있다.
2. 힙 압축 부재: 메모리 단편화를 해결하기 위한 힙 압축(Compaction) 과정이 없다.
3. 리소스 사용: Concurrent Sweep 과정에서 전체 힙을 탐색하며 CPU 리소스를 많이 사용하므로, 고부하 환경에서 성능 저하를 일으킬 수 있다.
4. 예측 불가능한 STW: STW 시간을 예측하거나 조정하기 어렵다.

## G1 GC: CMS의 대안
G1(Garbage First) GC는 CMS의 한계를 극복하기 위해 설계된 새로운 가비지 컬렉터다.

### G1 GC의 주요 특징
G1 GC는 힙 메모리를 다음과 같은 고정 크기의 Region으로 분할하여 관리한다:

1. Young Region: 새롭게 생성된 객체들이 위치
2. Old Region: 오랫동안 살아남은 객체들이 위치
3. Humongous Region: 큰 크기의 객체들을 위한 특별한 영역

G1 GC의 이름은 가장 많은 가비지를 포함한 Region부터 우선적으로 수집한다는 의미의 "Garbage First"에서 유래했다. 이러한 방식으로 최소한의 CPU 리소스로 최대의 메모리를 회수할 수 있다.

## Humongous Allocation 이해하기
Humongous 객체는 G1 GC에서 특별한 관리가 필요한 대상이다. Region 크기의 50%를 초과하는 객체를 Humongous 객체라고 정의하며, 이러한 객체들은 다음과 같은 특징을 가진다:

1. 할당 방식: 단일 Region에 담을 수 없어 여러 연속된 Humongous Region에 저장된다.
2. 성능 영향: Humongous Allocation이 실패할 경우, STW를 동반한 Full GC를 발생시킬 수 있다.
3. 메모리 낭비: 여러 Region에 걸쳐 관리되면서 마지막 Region의 메모리가 낭비될 수 있다.

### Humongous Allocation 문제 해결 방안
Humongous Allocation 문제를 해결하기 위한 방법들:

1. 객체 크기 관리: 큰 배열이나 컬렉션을 더 작은 단위로 분할하여 관리한다.
2. Region 크기 조정: `-XX:G1HeapRegionSize=<size>` 옵션을 사용하여 Region 크기를 조절할 수 있다.

## 결론
G1 GC는 CMS GC의 한계를 극복하기 위한 훌륭한 대안이지만, Humongous Allocation 관리에 있어서는 여전히 주의가 필요하다. 애플리케이션의 특성에 맞게 적절한 튜닝과 객체 크기 관리가 중요하다.
