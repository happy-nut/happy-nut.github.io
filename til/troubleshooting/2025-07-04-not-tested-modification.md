---
title: not-tested-modificatoin
date: 2025-07-04 13:33:46 +0900
---

## 증상

갑자기 `@RetryOnFailure` 어노테이션이 붙은 배치 잡이 동작하지 않음

## 원인

문제가 되었던 부분
```kotlin
val failures = opsForHash.entries(failJobsKey)
failures.forEach { (jobName, command) ->
  try {
    // 작업이 이미 실행 중인지 확인
      if (opsForHash.hasKey(inProgressJobsKey, jobName)) {
        log.info("이미 실행 중인 배치입니다: $jobName")
        return@forEach
      }

      // 작업을 실행 중으로 설정
      opsForHash.put(inProgressJobsKey, jobName, command)

      // 해당 작업 실행
      log.info("실패한 작업 재시도: $jobName, args: ${command.args.joinToString()}")
      // Spring bean 은 첫 글자가 소문자라서 변환해줌.
      val job = applicationContext.getBean(jobName.replaceFirstChar { it.lowercase() }) as? BatchJob
          ?: throw IllegalStateException("Job $jobName not found")
      job.execute(command)
      // 성공 시 Redis에서 실패 목록에서 제거
      opsForHash.delete(failJobsKey, jobName)
      log.info("재시도 성공: $jobName")
  } catch (e: Exception) {
      log.error("재시도 실패: $jobName, args: ${command.args.joinToString()}", e)
  } finally {
      // 실행 중 상태 제거
      opsForHash.delete(inProgressJobsKey, jobName)
  }
}
```
 
실행 부분은 다음과 같다.
```kotlin
@Around("@within(RetryOnFailure)")
fun handleRetryOnFailure(joinPoint: ProceedingJoinPoint): Any? {
    val targetClass = joinPoint.target::class.java
    val args = joinPoint.args.first() as BatchJobCommand
    val jobName = targetClass.simpleName
    log.info("handleRetryOnFailure $jobName")

    val inProgressKey = BatchJobKeys.inProgressJobsKey()
    val opsForHash = redisTemplate.opsForHash<String, BatchJobCommand>()
    if (opsForHash.hasKey(inProgressKey, jobName)) {
        throw RuntimeException("이미 실행 중인 배치입니다: $jobName")
    }

    val failKey = BatchJobKeys.failJobsKey()
    val result = try {
        // 배치 실행 전 실행 중 배치로 저장 및 TTL 설정
        log.info("handleRetryOnFailure put inProgressKey $jobName")
        opsForHash.put(inProgressKey, jobName, args)
        redisTemplate.expire(inProgressKey, Duration.ofDays(1))

        joinPoint.proceed()
    } catch (e: Exception) {
        // 실패한 배치 저장 및 TTL 설정
        log.info("handleRetryOnFailure put failKey $jobName")
        opsForHash.put(failKey, jobName, args)
        redisTemplate.expire(failKey, Duration.ofDays(1))

        throw e
    } finally {
        // 실행 후 성공 여부 관계 없이 실행 중 배치에서 제거
        opsForHash.delete(inProgressKey, jobName)
        log.info("handleRetryOnFailure delete inProgressKey $jobName")
    }

    // 성공 시 Redis에서 실패 키 제거
    opsForHash.delete(failKey, jobName)
    return result
}
```

job.execute(command)
이 부분에서 스프링 빈을 가져오고 여기에 어노테이션이 걸려 있으니
`opsForHash.put(inProgressJobsKey, jobName, command)`
를 job.execute 전에 해주게 되면 결국 if (progress,,) 분기에 걸려 배치잡이 동작하지 않게 된다

## 해결

중복해서 in-progress key 를 set 해주고 있으므로 `@Around` 밖에서 set/delete 해주는 부분을 제거함.

## KPT

- 최초 작성에 대해 테스트는 많이 했으나, 이후 변경분에 대한 테스트가 제대로 되지 않았음
- 그래놓고 예상한 대로 동작할 것이라고 기대함
