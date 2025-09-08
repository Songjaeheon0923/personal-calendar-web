# 📅 Personal Calendar Full-Stack Application

> **개인용 캘린더 웹 애플리케이션 - 완전히 간소화된 SQLite 기반 풀스택 구조**

## 🚀 **빠른 시작 (한 번의 클릭으로!)**

### **🖱️ 바탕화면 바로가기 (권장)**
1. 바탕화면에서 **우클릭** → **새로 만들기** → **바로가기**
2. **위치**: `C:\project\personal-calendar-web\start.bat`
3. **이름**: `Personal Calendar`
4. **아이콘 더블클릭** → 자동으로 서버 시작 + 브라우저 실행

### **⌨️ 명령어로 실행**
```bash
# Windows
start.bat

# 또는 npm으로
npm run dev
```

**🌐 브라우저에서 http://localhost:5173 으로 자동 접속됩니다!**

---

## 🏗️ **프로젝트 구조**

```
personal-calendar-web/
├── 📁 frontend/                 # React Frontend (Vite)
│   ├── 📁 src/
│   │   ├── 📄 App.jsx          # 메인 앱 컨테이너
│   │   ├── 📁 components/      # React 컴포넌트들
│   │   ├── 📁 hooks/           # 커스텀 훅 (3-Layer 구조)
│   │   │   ├── useApiSchedule.js  # 📊 API 데이터 관리
│   │   │   ├── useUI.js           # 🎨 UI 상태 관리
│   │   │   └── useCalendarHandlers.js # 🔄 이벤트 핸들링
│   │   ├── 📁 services/        # API 통신 서비스
│   │   │   └── api.js          # 백엔드 API 연결
│   │   ├── 📁 constants/       # 색상, 메시지 상수
│   │   └── 📁 utils/           # 유틸리티 함수
├── 📁 backend/                  # Node.js Backend (Express)
│   ├── 📄 server.js            # Express 서버 메인
│   ├── 📁 database/            # SQLite 데이터베이스
│   │   ├── 📄 database.js      # DB 연결 및 스키마
│   │   └── 📁 data/           # SQLite 파일 저장소
│   │       └── calendar.db    # 실제 DB 파일
│   ├── 📁 routes/              # API 라우트 (간소화)
│   │   ├── 📄 events.js       # 이벤트 CRUD API
│   │   └── 📄 categories.js   # 카테고리 API
│   └── 📄 package.json
├── 📄 start.bat                # Windows 실행 스크립트
├── 📄 package.json             # 루트 패키지 (concurrently 설정)
├── 📄 README.md               # 이 파일
└── 📄 .gitignore              # Git 무시 파일 설정
```

## 📊 **간소화된 데이터베이스 구조**

### **SQLite 테이블 (단 2개!)**

1. **📅 events** - 모든 일정 데이터
   ```sql
   - id (PRIMARY KEY)
   - title (일정 제목)
   - description (메모)
   - start_datetime (시작 날짜시간)
   - end_datetime (종료 날짜시간)
   - is_all_day (종일 여부)
   - color (색상)
   - created_at, updated_at
   ```

2. **🏷️ categories** - 기본 카테고리
   ```sql
   - id (PRIMARY KEY) 
   - name (카테고리 이름)
   - color (색상)
   - icon (아이콘)
   - sort_order (정렬 순서)
   - created_at
   ```

### **🎯 핵심 기능**

✅ **스마트 색상 시간 설정** - 색상 클릭으로 1시간 15분 간격 자동 설정  
✅ **다중일 이벤트** - 정확한 시작/종료 날짜시간 지원  
✅ **종일 이벤트** - 시간 없는 하루 종일 일정  
✅ **24시간 제한** - 종료시간 24:00 초과 방지  
✅ **실시간 저장** - SQLite 데이터베이스 즉시 저장  
✅ **드래그 미니 캘린더** - 날짜 선택을 위한 움직이는 달력  

## 🔧 **API 엔드포인트 (간소화)**

### **📅 이벤트 (Events)**
```
GET    /api/events              # 모든 이벤트 조회
POST   /api/events              # 새 이벤트 생성
GET    /api/events/:id          # 특정 이벤트 조회
PUT    /api/events/:id          # 이벤트 수정
DELETE /api/events/:id          # 이벤트 삭제
```

### **🏷️ 카테고리 (Categories)**
```
GET    /api/categories          # 모든 카테고리 조회
POST   /api/categories          # 새 카테고리 생성
```

## 📋 **사용 가능한 명령어**

### **개발 명령어**
```bash
npm run dev              # 🚀 프론트엔드 + 백엔드 동시 실행
npm run dev:backend      # 📡 백엔드만 실행 (포트 3001)
npm run dev:frontend     # 🌐 프론트엔드만 실행 (포트 5173, 자동 브라우저 실행)
```

### **설치 명령어** (start.bat에서 자동 실행)
```bash
npm run install:backend  # 📦 백엔드 의존성 설치
npm run install:frontend # 📦 프론트엔드 의존성 설치
```

### **코드 품질**
```bash
npm run lint             # 🔍 프론트엔드 코드 검사 (ESLint)
```

## 🎨 **색상 기반 시간 자동 설정**

일정 추가/수정 시 색상을 선택하면 자동으로 시간이 설정됩니다:

| 색상 | 번호 | 시작시간 | 종료시간 | 용도 |
|------|------|----------|----------|------|
| 🟡 노랑 | 1 | 09:00 | 10:15 | 1교시 |
| 🩷 분홍 | 2 | 10:30 | 11:45 | 2교시 |
| 💚 초록 | 3 | 12:00 | 13:15 | 점심/3교시 |
| 💙 파랑 | 4 | 13:30 | 14:45 | 4교시 |
| 🧡 주황 | 5 | 15:00 | 16:15 | 5교시 |
| 💜 보라 | 6 | 16:30 | 17:45 | 6교시 |
| 🔴 빨강 | - | 00:00 | 00:00 | 사용자 지정 |
| 🟢 연두 | - | 00:00 | 00:00 | 사용자 지정 |

## 💾 **데이터 저장소**

### **로컬 SQLite 파일**
- **위치**: `backend/data/calendar.db`
- **특징**: 프로젝트 내 파일로 저장, 완전 포터블
- **백업**: DB 파일 복사로 간단 백업
- **크기**: 경량 (수천개 이벤트도 몇 MB 이내)

## 🔧 **환경 설정**

### **Backend**
- **포트**: 3001 (자동 할당)
- **데이터베이스**: SQLite (로컬 파일)
- **CORS**: 프론트엔드 도메인만 허용

### **Frontend** 
- **포트**: 5173 (Vite 기본)
- **자동 브라우저**: `vite --open` 옵션으로 자동 실행
- **API URL**: http://localhost:3001/api

## 🆘 **트러블슈팅**

### **서버가 시작되지 않는 경우**
```bash
# Node.js 버전 확인
node --version  # 18.0 이상 필요

# 포트 사용 중 확인
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

### **데이터베이스 초기화**
```bash
# backend/data/calendar.db 파일 삭제 후 다시 실행
del backend\data\calendar.db
start.bat
```

### **브라우저가 자동으로 열리지 않는 경우**
- 수동으로 http://localhost:5173 접속
- 방화벽에서 포트 5173 허용 확인

## 🖥️ **바탕화면 바로가기 설정**

### **1. 바로가기 생성**
1. 바탕화면 **우클릭** → **새로 만들기** → **바로가기**
2. **위치 입력**: `C:\project\personal-calendar-web\start.bat`
3. **이름**: `Personal Calendar`

### **2. 아이콘 변경** (선택사항)
1. 바로가기 **우클릭** → **속성**
2. **아이콘 변경** → **찾아보기** 
3. `%SystemRoot%\System32\imageres.dll` → 인덱스 177번 (캘린더 아이콘)

### **3. 사용법**
- **실행**: 바탕화면 아이콘 더블클릭
- **종료**: 터미널에서 **Ctrl+C** (모든 서버 동시 종료)

## 🌟 **주요 개선사항**

### **⚡ 성능 최적화**
- React 19 최신 기능 활용
- SQLite 인덱스로 빠른 날짜 쿼리
- Vite 빌드 도구로 빠른 개발/빌드

### **🎯 사용성 개선**
- 한 번의 클릭으로 모든 서버 시작
- 색상 기반 스마트 시간 설정
- 직관적인 3-Layer 훅 아키텍처

### **🔒 데이터 안정성**
- SQLite 트랜잭션 지원
- 타입 체크 및 데이터 검증
- 에러 핸들링 및 폴백 로직

---

**🎉 개인용 최적화된 간단하고 강력한 캘린더 애플리케이션!**

**🖱️ 바탕화면 아이콘 한 번만 클릭하면 모든 것이 자동으로 실행됩니다!**
