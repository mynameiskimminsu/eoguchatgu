# 플로겟 Firebase Spark 구현

이 프로젝트는 Firebase Spark(무료)만 사용합니다. Blaze 전환, 결제수단, Cloud Functions는 사용하지 않습니다.

## 컬렉션

- `users/{uid}`: normalizedId, displayId, points, activeRoomId, hostedRoomId
- `usernames/{normalizedId}`: 대소문자·공백을 정리한 로그인 ID의 예약/소유 UID
- `rooms/{roomId}`: 모임 일정, 정원, 방장, 상태, 참가 인원
- `rooms/{roomId}/participants/{uid}`: 참가 이력과 상태
- `rooms/{roomId}/attendance/{uid}`: 방장 출석 처리 기록
- `rooms/{roomId}/followups/{uid}`, `pointClaims/{uid}`: 사용자당 한 번의 후속활동/포인트
- `penalties/{uid}`: 불참자 5분 제한
- `auditLogs/{logId}`: 생성·참가·출석·취소·시작·인증 이력

## 적용 순서

1. Firebase Console > Firestore Database > Rules에서 `firestore.rules`의 내용을 붙여넣고 **게시**합니다.
2. Authentication > Sign-in method에서 이메일/비밀번호 제공업체를 사용 설정합니다.
3. GitHub Pages에서는 `https://mynameiskimminsu.github.io/eoguchatgu/`로 접속합니다. `file://` 주소는 Firebase 인증/Firestore 동작을 보장하지 않습니다.

## 트랜잭션

회원 ID 선예약, 모임 생성, 참가, 참가 취소, 출석/제외, 봉사 시작, 후속활동+포인트 지급을 `runTransaction`으로 처리합니다. 마지막 한 자리 경쟁, 빠른 중복 클릭, 다른 방 중복 참가를 최신 Firestore 문서로 판정합니다.

## Emulator 테스트

Firebase CLI가 설치된 PC에서 다음을 실행합니다.

```powershell
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start --only auth,firestore
```

두 개의 브라우저 프로필로 같은 ID 생성, 마지막 자리 참가, 중복 클릭, 취소/출석 동시 요청, 방장 자기 참가, 이중 참가, 제외자 후속활동, 중복 포인트, 제재 만료 전후, 새로고침, 6주 달력을 확인합니다.

## Spark 보안 한계와 다음 단계

Rules와 클라이언트 트랜잭션은 일반적인 중복 요청을 방지하지만, 브라우저를 변조한 악의적 사용자의 포인트 증액·복합 상태 조작을 완전히 막을 수는 없습니다. 운영 전환 시 `createRoom`, `joinRoom`, `cancelJoin`, `markAttendance`, `startRoom`, `submitFollowupAndClaimPoints`, `expirePenalty`를 callable Cloud Functions로 옮기고 Admin SDK에서 최종 검증해야 합니다. 이 문서는 전환 계획일 뿐 현재 Blaze를 활성화하지 않습니다.
