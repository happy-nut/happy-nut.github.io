# VRRP (Virtual Router Redundancy Protocol)

여러 대의 라우터를 묶어서 하나의 IP를 서빙하는 프로토콜이다.
한 대의 라우터가 Master 가 되고 나머지가 Backup 으로 동작함.

Master 가 죽으면 Backup 중 하나가 Master 역할을 이어받는데,
이 때 외부에선 Virtual IP 로 보여지기 때문에 게이트웨이가 항상 살아 있는 것처럼 보여진다.

마스터가 교체될 때, Backup 중 우선 순위가 높은 장비가 즉시 자신의 네트워크 인터페이스에 VIP를 바인딩하고 트래픽을 받기 시작한다.

## 패킷 손실이 발생할 수 있는 경우들

- 위와 같이 failover 일어나는 경우 (Master 죽고 새로 교체되기까지의 트래픽)
- TCP 세션이 끊어져서 교체 이후에도 retry 하지 않으면 패킷 추가 손실 가능
- Client 가 ARP 캐싱으로 예전 master mac 으로 패킷을 전송하는 경우
  - 이를 방지하기 위해 교체 즉시 Gratuitous ARP 를 클라이언트에게 보냄(VIP의 새 mac 주소를 알리는 것)
