# 이중화

서버 이중화는 장애를 대비하기 위해 기존 시스템과 똑같은 기능을 하는 예비 시스템을 동시에 같이 운용하는 것이다.
장애가 없이 오랫동안 지속될 수 있는 특성을 고가용성(HA)이라고 한다.
서버 이중화에는 Active-Active, Active-standby 이렇게 2가지 방식이 있다.

Active-standy 는 트래픽을 처리하는 Active와 실제로 트래픽은 받지 않는 Stand-by(클론서버)로 나누어서
Active의 장애시 서비스 트래픽을 Stand-by로 라우팅해주는 방식이다.

Active-Active 는 둘 다 트래픽을 처리하면서 로드 벨런싱 기능을 수행하고, 한 쪽이 장애나는 경우 나머지 한 Active가
나머지 트래픽을 모두 감당하는 방식이다. 트래픽이 몰리면서 또 장애로 이어질 수 있기 때문에, Active-Standby보다 더 높은 스펙으로 인프라를 구축하는 것이 보통이다.
