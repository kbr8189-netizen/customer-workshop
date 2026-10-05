# 고객 지향성 실습 웹 교재

빈칸 채우기 실습(구청 민원응대 상황)을 교육생이 휴대폰으로 작성하는 웹앱입니다.

- 교육생 화면: `/` — 이름·조 입력 → 진행 안내 / 개인 작성 / 팀 답안(조원 답 비교 후 팀 최선 답안 저장)
- 강사 화면: `/admin` — 비밀번호 로그인 후 실습 타이머, 문항별 조 답안 공유(크게 보기), 조별 개인 답안, 제출 현황, CSV 다운로드

## 구성

- Next.js (App Router) + TypeScript + Tailwind CSS
- 저장: Vercel Blob **비공개** 스토어 (`personal/<id>.json`, `team/<조 번호>.json`)
- 문항·조 수 수정: `lib/workshop.ts` (문장 속 `[]`가 빈칸)

## 환경 변수 (Vercel 프로젝트 설정)

| 이름 | 설명 |
| --- | --- |
| `ADMIN_PASSWORD` | 강사 화면 비밀번호 |
| `BLOB_READ_WRITE_TOKEN` | Blob 스토어를 프로젝트에 연결하면 자동 설정 |

## 로컬 실행

```bash
npm install
ADMIN_PASSWORD=test npm run dev   # Blob 토큰이 없으면 .data/ 폴더에 저장
```
