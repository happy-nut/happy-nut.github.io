# JDBC(Java Database Connectivity)

데이터베이스에 접근하기 위한 표준 API 로,
Java 애플리케이션에서 여러 종류의 데이터베이스에 다음과 같이 일관된 방식으로 상호 작용하기 위해 만들어졌다.

```java
// MySQL
String url = "jdbc:mysql://localhost:3306/mydb";

// PostgreSQL  
String url = "jdbc:postgresql://localhost:5432/mydb";

// Oracle
String url = "jdbc:oracle:thin:@localhost:1521:xe";

// 동일한 인터페이스를 사용하여 상호 작용.
Connection conn = DriverManager.getConnection(url, user, password);
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM users");
```

## Options

### 일반 쿼리 성능 관련

```java
String url = "jdbc:mysql://localhost:3306/mydb?" +
  "useServerPrepStmts=true&" +           // 서버 측 Prepared Statement 사용
  "cachePrepStmts=true&" +               // PreparedStatement 캐싱 활성화
  "prepStmtCacheSize=250&" +             // 캐시할 PreparedStatement 개수
  "prepStmtCacheSqlLimit=2048&" +        // 캐시할 SQL 최대 길이
  "useLocalSessionState=true&" +         // 세션 상태 로컬 캐싱
  "useLocalTransactionState=true";       // 트랜잭션 상태 로컬 캐싱
```

`useServerPrepStmts` 옵션은 쿼리 Prepared statement 를 DB 서버에서 처리하도록 설정하는 옵션이다.
Prepared statement 란 쿼리를 미리 컴파일하고 실행 계획을 캐싱하여 성능을 향상시키는 방법이다.
예를 들어 다음과 같은 쿼리가 있다고 하자.

```sql
SELECT * FROM users WHERE id = 123;
SELECT * FROM users WHERE id = 456;
SELECT * FROM users WHERE id = 789;
```

id 값이 바뀌는 많은 쿼리에서 매번 쿼리를 파싱하고 인덱스가 걸리는 경우 쿼리 실행을 분석한다.
그러나 Prepared statement 를 사용하면 쿼리를 미리 컴파일하고 실행 계획을 캐싱하여, 동일한 쿼리를 반복 실행할 때 성능을 크게 향상시킬 수 있다.

```sql
SELECT * FROM users WHERE id = ?;
[123, 456, 789] -> Prepared statement 실행
```

하지만 반복되는 쿼리가 많지 않다면 오히려 오버헤드를 증가시키기 때문에, 향상 그 사이의 트레이드오프를 고려해야 한다.


### 배치 처리 성능 관련

```java
String url = "jdbc:mysql://localhost:3306/mydb?" +
  "rewriteBatchedStatements=true&" +     // 배치를 단일 문장으로 재작성
  "allowMultiQueries=true&" +            // 멀티 쿼리 허용
  "defaultFetchSize=1000";               // 기본 fetch 크기
```

### 연결 관련

```java
String url = "jdbc:mysql://localhost:3306/mydb?" +
  "connectTimeout=30000&" +              // 30초 연결 타임아웃
  "socketTimeout=30000&" +               // 30초 읽기 타임아웃
  "autoReconnect=false";                 // 커넥션 풀 사용 시 비권장
```

### 트랜잭션 관련

```java
String url = "jdbc:mysql://localhost:3306/mydb?" +
  "autoCommit=false&" +                  // 자동 커밋 비활성화
  "defaultTransactionIsolation=READ_COMMITTED&" + // 기본 격리 수준
  "relaxAutoCommit=true";                // AutoCommit 관련 완화
```
