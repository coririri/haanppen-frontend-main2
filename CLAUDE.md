# Claude Project Rules

## Project Overview

- **앱 이름**: haanppen
- **프레임워크**: React
- **배포 플랫폼**: 브라우저

## Development Rules

- 상태관리, 라우팅 등 주요 패키지 도입 시 반드시 사용자에게 선택지를 제시하고 확인 후 진행

## Git & SSH

- Remote: `https://github.com/coririri/haanppen-frontend-main2.git`
- GitHub 계정: `coririri` (HTTPS 방식으로 인증)

## Branch Naming Rules

```
<type>/<short-description>
```

### Branch Types

- `feat/` : 새 기능 개발
- `fix/` : 버그 수정
- `refactor/` : 코드 개선
- `chore/` : 설정/유지보수
- `docs/` : 문서

### Rules

- 소문자, 하이픈(`-`) 사용 (언더스코어 금지)
- 기본 브랜치: `develop` (작업 브랜치는 `develop`에서 분기)
- `main`은 배포용, `develop`에서 PR로만 병합

## PR Message Rules

When the user says:

- "PR"
- "pr"
- "풀리퀘"

Claude must:

1. Analyze all commits between current branch and base branch
2. Create PR using `gh pr create` with the format below
3. Write title and body in Korean
4. Do not ask for confirmation, create immediately

### PR Format

```
제목: [타입] 한 줄 요약 (70자 이내)

본문:
## 작업 내용
- 변경사항을 bullet point로 요약

## 테스트
- [ ] 웹(Chrome)에서 확인
```

### PR Title Types

- feat: 새 기능
- fix: 버그 수정
- refactor: 코드 개선
- chore: 설정/유지보수
- docs: 문서

---

## Commit Message Rules

When the user says:

- "커밋"
- "cm"

Claude must:

1. Analyze staged changes only
2. Use Conventional Commit format
3. Keep the message concise
4. Output only the commit message
5. Do not include explanations

### Conventional Commit Types

- feat: new feature
- fix: bug fix
- refactor: code restructuring
- chore: setup / config / maintenance
- docs: documentation changes
- test: test related changes
