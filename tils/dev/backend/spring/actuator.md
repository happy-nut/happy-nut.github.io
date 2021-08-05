# Spring Actuator

어플리케이션을 모니터링하고 관리하는 기능을 위한 친구다.

actuator 에서 기본 세팅 후 `localhost:8080/actuator` 접근해보면 다음과 같이 나타남.

```
{
    "_links": {
        "self": {
            "href": "http://localhost:8080/actuator",
            "templated": false
        },
        "health": {
            "href": "http://localhost:8080/actuator/health",
            "templated": false
        },
        "health-path": {
            "href": "http://localhost:8080/actuator/health/{*path}",
            "templated": true
        },
        "info": {
            "href": "http://localhost:8080/actuator/info",
            "templated": false
        }
    }
}
```


`localhost:8080/actuator/health` 들어가보면 응답 잘 나옴

```
{
    "status": "UP"
}
```


yaml 에서 다음과 같이 수정해볼 수 있음. 자세한 건 나중에 필요할 때 [공식 문서](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html) 를 참고해보면 좋을 것 같다.

```
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

## 특징

* 메모리에 저장되어서 메트릭이 영속화되지 않음. 이 부분은 따로 처리가 필요함.
* 민감한 정보가 많기 때문에 보안에 신경써줘야 함.
