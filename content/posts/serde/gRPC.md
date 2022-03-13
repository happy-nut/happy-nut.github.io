---
title: gRPC란
date: 2022-03-13
slug: "/grpc"
tags:
  - 개발
  - grpc
  - gRPCurl
  - serialization/deserialization
---

RPC는 Remote Procedure Call의 약자로, 원격 머신에 있는 함수(Procedure)를 마치 로컬에 있는 객체의 메소드를 쓰듯 호출하는 기능입니다.

어떻게 그게 가능할까요?

우선 원격에 있는 함수를 호출하기 위해서는 그 함수가 받아야 하는 request parameter 와 그 함수가 반환하는 response parameter 가
함수를 호출하는 쪽과 호출당하는 곳이 서로 통일되게 구현되어져야 합니다. 이를 위해 IDL(Interface Description Language)로 해당 함수의
인터페이스 규약을 정의하는데, 보통은 IDL을 기반으로 Caller와 Callee의 구현부(코드)를 생성합니다.

이를 각각 **Skeleton**과 **Stub**(Client라고 부르기도 한다) 이라 합니다.

## REST vs RCP

RPC는 REST와 많이 비교됩니다. 주목해야 할 부분은 다음과 같습니다:

- 속도가 빠릅니다(HTTP를 사용하는 REST에 비해 성능이 좋다).
- 원격에 있는 함수임에도 불구하고 타입 체킹이 됩니다.
- 단방향인 REST와는 달리, 양방향 통신이 가능합니다.
- Streaming 이 지원됩니다.

## gRPC

쉽게 말해서, [gRPC](https://grpc.io/) 는 이러한 RPC를 IDL로서 google protobuf를 사용하여 구현한 것입니다. 원리를 그림과 함께 조금만 더 들여다 봅시다.

![gRPC overview](https://grpc.io/img/landing-2.svg)

위 그림에서 볼 수 있듯, 서버 사이드(C++ Service)는 `.proto` 파일에 명시된 서비스의 인터페이스를 **구현(Skeleton)**하고, gRPC 서버를 열어 대기합니다.
이 때, gRPC의 내부적인 인프라 레이어에서는 들어오는 요청은 디코딩하고 나가는 응답은 인코딩합니다.

클라이언트 사이드(Ruby Client, Android-Java Client)는 마찬가지로 같은 `.proto` 파일에 정의된 인터페이스를 각 언어에 맞게 **구현(Stub)**하고,
해당 객체의 메소드를 호출하여 gRPC 서비스를 사용합니다. 보통 이런 구현은 코드 제너레이터가 자동으로 생성해 줍니다.

이 때 요청하는 메시지는 protobuf Message 타입이어야 합니다. 응답 역시 마찬가지로 protobuf Message 타입입니다.

## gRPCurl

우리는 `curl`이라는 HTTP에 유용한 CLI를 알고 있는데요, [gRPCurl](https://github.com/fullstorydev/grpcurl) 은 gRPC용 `curl`이라고 보면 되겠습니다.
`curl` 과 사용법이 비슷하니, 자세한 내용은 링크된 메뉴얼을 참고해보세요.
