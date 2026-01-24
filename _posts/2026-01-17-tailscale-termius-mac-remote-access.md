---
title: "Tailscale과 Termius로 Mac 원격 접속: 어디서든 내 Mac을 내 것처럼"
date: 2026-01-17 09:00:00 +0900
categories: [engineering, operation]
tags: [mac, remote-access, tailscale, termius, vpn, ssh, caffeinate, productivity]
description: "Mac 원격 접속을 위한 Tailscale과 Termius 활용 가이드. 언제 어디서든 Mac PC에 접속하여 업무 효율을 높이는 방법을 소개한다."
image: /assets/img/posts/tailscale-network-configuration.png
mermaid: false
---

언제 어디서든 내 Mac PC에 접속하고 싶은 니즈는 IT 업무를 하는 사람이라면 누구나 한 번쯤 느껴봤을 것이다. 특히 복잡한 개발 환경이나 특정 리소스에 접근해야 할 때, 혹은 장시간 걸리는 작업을 원격으로 관리해야 할 때 그 중요성은 더욱 커진다. 나 또한 외부 활동 중에 AI에게 PR을 올리도록 하거나, 복잡한 백테스트를 돌려야 하는 상황이 생기면서 Mac 원격 접속의 필요성을 절실히 느끼게 되었다.

이러한 니즈를 해결하기 위해 **Tailscale**과 **Termius**라는 두 가지 도구를 활용해 보았다. 결과적으로 매우 만족스러웠으며, 왜 진작 사용하지 않았을까 하는 생각이 들 정도로 편리함을 경험하고 있다.

## Tailscale로 안전한 VPN 터널 구축

가장 먼저 필요한 것은 안전한 네트워크 연결이다. Tailscale은 기존 VPN 설정의 복잡함을 획기적으로 줄여주는 서비스다. 마치 같은 네트워크에 있는 것처럼 기기들을 연결해주는 **메시(Mesh) VPN** 방식으로 작동한다. 이를 통해 별도의 복잡한 설정 없이도 Tailscale이 설치된 모든 기기 간에 암호화된 터널을 쉽고 빠르게 구축할 수 있다.

![Tailscale 네트워크 구성 화면](/assets/img/posts/tailscale-network-configuration.png)
_Tailscale_

Mac PC에 Tailscale을 설치하고 로그인하면, 자동으로 가상 IP가 할당되고 안전한 VPN 네트워크에 참여하게 된다. 이 과정을 통해 모바일 기기에서도 Tailscale VPN을 활성화하면, 마치 같은 와이파이에 연결된 것처럼 Mac PC의 내부 네트워크에 접근할 수 있는 기반이 마련된다.

## Termius로 스마트한 원격 관리

안전한 터널이 구축되었다면, 이제 원격으로 Mac PC에 접속하여 명령어를 실행할 차례다. 나는 이 역할을 **Termius**를 통해 수행한다. Termius는 SSH 클라이언트이자 터미널 에뮬레이터로, 깔끔한 UI와 다양한 편의 기능을 제공한다. 

![Termius 연결 설정 화면](/assets/img/posts/termius-connection-setup.png)
_Termius에서 Tailscale로부터 할당받은 VPN 주소를 설정하여 연결할 수 있다._

Tailscale을 통해 할당받은 Mac PC의 가상 IP 주소를 위와 같이 Termius에 등록하면, 언제 어디서든 안정적으로 Mac 터미널에 접속할 수 있다.

![Termius를 이용한 원격 접속 화면](/assets/img/posts/termius-remote-management.png)
_Termius를 이용한 원격 접속 화면_

Termius의 가장 유용한 기능 중 하나는 **스니펫(Snippet)**이다. 자주 사용하는 명령어 조합이나 스크립트를 스니펫으로 저장해두면, 필요할 때마다 손쉽게 불러와 실행할 수 있다. 예를 들어, 특정 개발 환경을 활성화하는 명령어 세트나, 자주 실행하는 백테스트 스크립트 등을 스니펫으로 만들어두면 작업 효율을 극대화할 수 있다. 일상적인 작업부터 복잡한 스크립트 실행까지, Termius는 모바일 환경에서의 원격 작업을 한층 더 편리하게 만들어 준다고 생각한다.

![Termius 스니펫 활용 화면](/assets/img/posts/tailscale-vpn-tunnel.png)
_Termius 스니펫 활용 예시_


## 원격 작업을 위한 Mac PC 설정: 잠들지 않는 Mac

원격 접속의 안정성을 위해서는 대상 Mac PC가 언제든 접속 가능한 상태를 유지해야 한다. 기본 설정으로 Mac은 일정 시간 사용하지 않으면 잠자기 모드로 진입하기 때문에, 원격 접속이 끊기거나 불가능해질 수 있다. 이를 방지하기 위해 `caffeinate` 명령어를 활용한다.

터미널에서 `caffeinate -dimsu` 명령어를 실행하면, Mac이 디스플레이를 끄고 잠자기 모드로 진입하는 것을 방지할 수 있다.
- `-d`: 디스플레이가 잠드는 것을 방지한다.
- `-i`: 유휴(idle) 상태로 인해 시스템이 잠드는 것을 방지한다.
- `-m`: 디스크가 유휴 상태로 인해 잠드는 것을 방지한다.
- `-s`: 시스템이 잠드는 것을 방지한다 (가장 중요).
- `-u`: 사용자 활동을 시뮬레이트하여 디스플레이를 켜둔다.

이 명령어를 백그라운드에서 실행하거나, 혹은 필요할 때마다 실행해두면 원격 접속 중 Mac이 잠들어버리는 불편함 없이 지속적인 작업 환경을 유지할 수 있다.

---

Tailscale과 Termius의 조합은 Mac 원격 접속을 위한 강력하고 편리한 해결책을 제공한다. 이 솔루션을 통해 시간과 장소에 구애받지 않고 Mac PC의 잠재력을 최대한 활용할 수 있게 되었다. 단순한 원격 접속을 넘어, 업무의 유연성과 생산성을 크게 향상시킬 수 있는 방법이라고 생각한다. 혹시 나처럼 언제 어디서든 내 Mac을 활용하고 싶은 니즈가 있다면, 이 조합을 적극 추천한다.
