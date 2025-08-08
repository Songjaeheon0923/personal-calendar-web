# 📅 Personal Calendar Web Application

> **현대적이고 직관적인 React 기반 웹 캘린더**

개인 일정을 효율적으로 관리할 수 있는 혁신적인 웹 캘린더 애플리케이션입니다. 다중일 이벤트 띠지, 드래그 가능한 미니 캘린더, 그룹 hover 효과 등 독창적인 UI/UX 기능을 제공합니다.

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)

## 주요 기능

### 🎯 **핵심 기능**
- **완전 커스텀 월별 뷰**: react-big-calendar를 확장한 자체 구현 캘린더
- **다중일 이벤트 띠지**: 여러 날짜에 걸친 일정을 하나의 연속된 띠지로 표시
- **그룹 hover 효과**: 다중일 이벤트의 모든 부분이 동시에 hover 반응
- **인터랙티브 사이드바**: 날짜 클릭으로 해당 날짜의 일정 즉시 확인
- **컨텍스트 메뉴**: 우클릭으로 빠른 일정 추가/편집/삭제

### **혁신적 UI/UX**
- **드래그 가능한 미니 캘린더**: 모달 내에서 자유롭게 위치 이동
- **우선순위 기반 정렬**: 다중일 > 시간 있는 일정 > 종일 일정 순 배치
- **스마트 표시 제한**: 3개 이하는 모두, 4개 이상은 2개 + "더보기"
- **⌨키보드 네비게이션**: Enter 키로 입력 필드 간 이동
- **URL 자동 링크**: 메모의 URL을 자동으로 클릭 가능한 링크로 변환

### 💾 **데이터 관리**
- **로컬 스토리지**: 브라우저에 일정 데이터 자동 저장
- **날짜 범위 지원**: 시작일-종료일 범위 일정 생성
- **색상 카테고리**: 일정별 색상 구분
- **풍부한 메모**: 세부 내용 및 링크 포함 가능

##  아키텍처

### **커스텀 훅 기반 상태 관리**
```javascript
// 3-Layer 아키텍처
useSchedule()        // 일정 데이터 & CRUD 작업
    ↓
useUI()              // UI 상태 & 모달/사이드바 관리  
    ↓
useCalendarHandlers() // 이벤트 핸들링 & 상호작용
```

### **컴포넌트 구조**
```
App.jsx (68줄) - 극도로 리팩토링된 메인 컨테이너
├── Calendar.jsx - react-big-calendar 래퍼
│   └── NewMonthView.jsx - 완전 커스텀 월별 뷰
├── Sidebar.jsx - 날짜별 일정 목록
└── ModalContainer.jsx - 중앙화된 모달 관리
    ├── AddScheduleModal.jsx - 일정 추가
    ├── ScheduleDetailModal.jsx - 일정 수정/삭제
    ├── MiniCalendar.jsx - 드래그 가능한 미니 캘린더
    └── Context Menus - 우클릭 메뉴들
```

## 🛠️ 기술 스택

### **Frontend**
- **React 19.1.0** - 최신 React with Hooks
- **Vite 7.0.4** - 차세대 빌드 도구
- **Tailwind CSS 3.4.1** - 유틸리티 우선 CSS

### **Calendar & Date**
- **react-big-calendar 1.19.4** - 캘린더 기반 라이브러리
- **date-fns 4.1.0** - 한국어 로케일 날짜 처리
- **dayjs 1.11.13** - 추가 날짜 유틸리티

### **Development**
- **ESLint** - 코드 품질 관리
- **PostCSS + Autoprefixer** - CSS 후처리

## 📁 프로젝트 구조

```
📁 personal-calendar-web/
├── 📁 my-scheduler-app/           # 메인 애플리케이션
│   ├── 📁 src/
│   │   ├── 📄 App.jsx            # 메인 컨테이너 (68줄)
│   │   ├── 📁 components/        # React 컴포넌트
│   │   │   ├── Calendar.jsx           # 캘린더 래퍼
│   │   │   ├── NewMonthView.jsx       # 커스텀 월별 뷰 
│   │   │   ├── Sidebar.jsx            # 사이드바
│   │   │   ├── ModalContainer.jsx     # 모달 중앙 관리
│   │   │   ├── MiniCalendar.jsx       # 드래그 캘린더 
│   │   │   └── ...                    # 기타 컴포넌트들
│   │   ├── 📁 hooks/             # 커스텀 훅
│   │   │   ├── useSchedule.js         # 일정 데이터 관리
│   │   │   ├── useUI.js               # UI 상태 관리  
│   │   │   ├── useCalendarHandlers.js # 이벤트 핸들러
│   │   │   └── useLocalStorage.js     # 로컬 스토리지
│   │   ├── 📁 utils/             # 유틸리티
│   │   │   ├── calendarConfig.js      # 캘린더 설정
│   │   │   ├── textUtils.jsx          # 텍스트/링크 처리
│   │   │   └── dateHelpers.js         # 날짜 유틸리티
│   │   ├── 📁 styles/            # CSS 파일
│   │   │   └── NewCalendar.css        # 커스텀 캘린더 스타일 
│   │   └── 📁 constants/         # 상수 정의
│   └── 📄 package.json           # 의존성 관리
├── 📄 README.md                  # 프로젝트 소개
├── 📄 CLAUDE.md                  # Claude Code 가이드
└── 📄 TECHNICAL_DOCUMENTATION.md # 기술 문서
```

## 혁신적 기능 상세

###  **다중일 이벤트 띠지 시스템**
```css
/* 시각적 연결 효과 */
.multi-start  { border-right: 직각 }  /* 시작일 */
.multi-middle { border: 직각 }        /* 중간일 */  
.multi-end    { border-left: 직각 }   /* 종료일 */
```
- **연속된 사각형**: CSS로 구현된 완벽한 시각적 연결
- **중앙 제목**: 시작일에만 제목 표시, 가운데 정렬
- **그룹 hover**: 한 부분 hover 시 전체 띠지 동시 반응

### **우선순위 기반 정렬**
```javascript
// 정렬 로직 (NewMonthView.jsx)
1️⃣ 다중일 이벤트 (최상단)
2️⃣ 단일일 시간 있는 일정 (시작시간 순)
3️⃣ 종일 일정 (최하단)
```

### **드래그 가능한 미니 캘린더**
```javascript
// 모달 내 자유로운 드래그
- 실시간 위치 계산
- 모달 경계 제한  
- 드래그 후 위치 기억
- 시작일/종료일 구분 지원
```

## 시작하기

### **설치 및 실행**
```bash
# 프로젝트 디렉토리 이동
cd my-scheduler-app

# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 코드 검사
npm run lint
```

### **주요 명령어**
- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드  
- `npm run preview` - 빌드 결과 미리보기
- `npm run lint` - ESLint 코드 검사

## 사용법

### **일정 관리**
1. **일정 추가**
   - 캘린더 날짜 클릭 → 사이드바에서 "+ 새 일정 추가" 
   - 날짜 셀 우클릭 → "새 일정 추가"
   - 헤더 "+ 새 일정 추가" 버튼

2. **일정 보기**
   - 날짜 클릭 → 사이드바에 해당 날짜 일정 표시
   - 일정 카드 클릭 → 세부 내용 확장/축소

3. **일정 수정**
   - 사이드바 일정 카드의 "수정" 버튼
   - 캘린더 일정 우클릭 → "수정"

4. **일정 삭제** 
   - 사이드바 일정 카드의 "삭제" 버튼
   - 캘린더 일정 우클릭 → "삭제"

### **고급 기능**
- **다중일 일정**: 시작일과 종료일을 다르게 설정
- **드래그 미니 캘린더**: 날짜 선택 시 캘린더를 원하는 위치로 드래그
- **키보드 네비게이션**: Enter 키로 입력 필드 간 이동
- **자동 링크**: 메모에 URL 입력 시 자동으로 클릭 가능한 링크 생성

## 프로젝트 특징

### ** 혁신적 UX**
- **시각적 연결**: 다중일 이벤트의 완벽한 띠지 연결 효과
- **직관적 상호작용**: 클릭, 우클릭, 드래그로 모든 기능 접근


### **고성능 아키텍처**
- **커스텀 훅 분리**: 관심사 분리로 유지보수성 극대화
- **컴포넌트 모듈화**: 재사용 가능한 컴포넌트 설계
- **효율적 렌더링**: useMemo, useCallback 적극 활용

### ** 안정성**
- **에러 핸들링**: 각 기능별 안전 장치
- **타입 안전성**: PropTypes 및 방어적 프로그래밍
- **데이터 무결성**: 로컬 스토리지 안전 저장/로드

## 개발자 가이드

### **핵심 개발 원칙**
1. **컴포넌트 순수성**: 사이드 이펙트 최소화
2. **단일 책임 원칙**: 각 훅과 컴포넌트의 명확한 역할
3. **불변성 유지**: 상태 업데이트 시 불변성 보장
4. **접근성 고려**: ARIA 라벨 및 키보드 네비게이션

### **확장 가능성**
- **새로운 뷰 모드**: 주간/일간 뷰 추가 가능
- **외부 API 연동**: REST API나 GraphQL 연동 준비됨
- **다국어 지원**: i18n 라이브러리 추가 가능
- **테마 시스템**: CSS 변수 기반 테마 전환

---