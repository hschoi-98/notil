# 노틸

필기하면 바로 웹사이트가 되는 플랫폼.  
`notil.click/username` 으로 접속하면 에디터에서 작성한 내용이 그대로 보입니다.

## 기술 스택

| 역할 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 배포 | AWS Lambda + CloudFront (SST) |
| DB | Aurora Serverless v2 (PostgreSQL) |
| ORM | Prisma |
| 인증 | bcryptjs + JWT (HttpOnly Cookie) |
| MD 변환 | markdown-it |

## 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 값을 채웁니다.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/notesite"
JWT_SECRET="최소-32자-이상의-랜덤-문자열"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

로컬 PostgreSQL이 없으면 Docker로 빠르게 실행:

```bash
docker run -d \
  --name notesite-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=notesite \
  -p 5432:5432 \
  postgres:16
```

### 3. DB 스키마 적용

```bash
npm run db:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인합니다.

---

## AWS 배포 설정

### 1. AWS 리소스 준비

**Aurora Serverless v2 생성** (RDS 콘솔)
- Engine: PostgreSQL 15
- Capacity: 0.5 ~ 8 ACU (서버리스)
- VPC: 기본 VPC 사용 가능
- RDS Proxy 활성화 (Lambda 연결 풀링)

**IAM 사용자 생성** (GitHub Actions 배포용)
- 권한: `AdministratorAccess` (또는 SST 최소 권한 정책)
- Access Key / Secret Key 발급

### 2. GitHub Secrets 등록

GitHub 레포 → Settings → Secrets and variables → Actions

| Secret 이름 | 값 |
|-------------|-----|
| `AWS_ACCESS_KEY_ID` | IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Key |
| `DATABASE_URL` | Aurora RDS Proxy 엔드포인트 |
| `JWT_SECRET` | 32자 이상 랜덤 문자열 |
| `NEXT_PUBLIC_APP_URL` | `https://notil.click` |

### 3. 첫 배포

```bash
# 로컬에서 SST 초기 부트스트랩 (최초 1회)
npx sst deploy --stage production
```

이후 `main` 브랜치에 push하면 GitHub Actions가 자동으로 배포합니다.

### 4. 커스텀 도메인 연결 (선택)

Route 53에 도메인 등록 후 `sst.config.ts` 의 `customDomain` 주석 해제:

```ts
customDomain: {
  domainName: "notil.click",
  hostedZone: "notil.click",
},
```

---

## URL 구조

| URL | 설명 |
|-----|------|
| `notil.click/` | 로그인 / 회원가입 |
| `notil.click/editor` | 필기 에디터 (로그인 필요) |
| `notil.click/[username]` | 퍼블릭 웹페이지 |
| `notil.click/[username]?section=이력서` | 섹션 직접 링크 |

## 예상 비용 (AWS)

| 가입자 수 | 월 예상 비용 |
|-----------|-------------|
| ~100명 | $3 ~ $8 |
| ~1,000명 | $15 ~ $30 |
| ~10,000명 | $80 ~ $150 |

Lambda는 요청당 과금이라 사용자가 없으면 비용도 거의 없습니다.
