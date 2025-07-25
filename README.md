# Personal Calendar Web Application

## 📅 프로젝트 소개

개인 일정을 효율적으로 관리할 수 있는 React 기반의 현대적인 웹 캘린더 애플리케이션입니다. 직관적인 사이드바 인터페이스와 메모지 스타일의 디자인으로 일정 관리를 더욱 편리하게 만들어줍니다.

> **최종 수정일**: 2025년 7월 24일

## ✨ 주요 기능

- **인터랙티브 캘린더**: 날짜 클릭으로 해당 날짜의 일정을 사이드바에서 바로 확인
- **컨텍스트 메뉴**: 날짜 셀 및 이벤트 우클릭으로 빠른 일정 추가/편집/삭제
- **실시간 사이드바**: 일정 추가/수정 시 즉시 반영되는 반응형 사이드바
- **메모지 스타일 디자인**: 아름다운 그라데이션과 장식 요소가 있는 카드형 일정 표시
- **키보드 네비게이션**: Enter 키로 입력 필드 간 이동, 4자리 시간 입력 시 자동 포커스 이동
- **URL 자동 링크**: 일정 내용의 URL을 자동으로 클릭 가능한 링크로 변환
- **확장/축소 기능**: 일정 카드 클릭으로 세부 내용 보기/숨기기
- **로컬 스토리지**: 브라우저에 일정 데이터 자동 저장

## 🛠️ 기술 스택

- **React 19**: 최신 React 기능과 Hooks 기반 개발
- **Vite**: 빠른 개발 서버와 최적화된 빌드 도구
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **react-big-calendar**: 강력한 캘린더 컴포넌트 라이브러리
- **date-fns**: 날짜 처리 라이브러리 (한국어 로케일 지원)

## 📁 프로젝트 구조

```
my-scheduler-app/
├── src/
│   ├── App.jsx                  # 메인 애플리케이션 컨테이너
│   ├── main.jsx                 # React 앱 진입점
│   ├── index.css                # 글로벌 스타일
│   ├── components/              # 주요 UI 컴포넌트
│   │   ├── Calendar.jsx               # 메인 캘린더
│   │   ├── CalendarDateHeader.jsx     # 날짜 셀 헤더
│   │   ├── CalendarToolbar.jsx        # 캘린더 툴바
│   │   ├── Sidebar.jsx                # 사이드바(일정 목록)
│   │   ├── ModalContainer.jsx         # 모달 컨테이너
│   │   ├── AddScheduleModal.jsx       # 일정 추가 모달
│   │   ├── ScheduleDetailModal.jsx    # 일정 상세/수정 모달
│   │   ├── YearMonthPicker.jsx        # 년/월 선택기
│   │   ├── MiniCalendar.jsx           # 드래그 가능한 미니 캘린더
│   │   ├── DateCellContextMenu.jsx    # 날짜 셀 우클릭 메뉴
│   │   ├── EventContextMenu.jsx       # 이벤트 우클릭 메뉴
│   │   └── TimePicker.jsx             # 시간 선택 컴포넌트
│   ├── hooks/                   # 커스텀 훅
│   │   ├── useSchedule.js            # 일정 상태/로컬스토리지
│   │   ├── useUI.js                  # UI/모달/사이드바/미니캘린더 상태
│   │   ├── useCalendarHandlers.js    # 캘린더 이벤트 핸들러
│   │   └── useLocalStorage.js        # 로컬 스토리지 관리 훅
│   ├── constants/               # 일정 카테고리 등 상수
│   │   └── index.js
│   └── utils/                   # 유틸리티 함수
│       ├── calendarConfig.js         # 캘린더 localizer/스타일
│       ├── textUtils.jsx             # 텍스트 처리/링크 변환
│       └── timeUtils.js              # 시간 처리/ID 생성
├── public/                      # 정적 파일 (vite.svg 등)
└── package.json                 # 프로젝트 의존성 및 스크립트
```

## 🔧 주요 컴포넌트 설명

### App.jsx
- **역할**: 메인 애플리케이션 컨테이너 (리팩토링으로 644줄 → 68줄로 단순화)
- **기능**: 
  - 커스텀 훅을 통한 상태 관리 분리
  - 컴포넌트 모듈화로 코드 가독성 향상
  - 전체 애플리케이션 레이아웃 관리

### components/Calendar.jsx
- **역할**: 메인 캘린더 컴포넌트
- **기능**:
  - react-big-calendar 래퍼 컴포넌트
  - 날짜 셀 및 이벤트 우클릭 감지
  - 컨텍스트 메뉴 활성화 시 다른 상호작용 차단

### components/DateCellContextMenu.jsx & EventContextMenu.jsx
- **역할**: 우클릭 컨텍스트 메뉴 컴포넌트들
- **기능**:
  - 날짜 셀/이벤트 우클릭 시 메뉴 표시
  - 외부 클릭 시 모든 이벤트 차단으로 안정적인 UX
  - 일정 추가/편집/삭제 빠른 접근

### components/YearMonthPicker.jsx
- **역할**: 년도/월 선택 모달 컴포넌트
- **기능**:
  - 년도와 월을 선택할 수 있는 드롭다운 인터페이스
  - 외부 클릭 시 모달 자동 닫기
  - 선택된 날짜로 캘린더 네비게이션

### components/TimePicker.jsx
- **역할**: 시간 입력 컴포넌트
- **기능**:
  - 시작 시간과 종료 시간 입력
  - 키보드 네비게이션 (Enter, 4자리 자동 이동)
  - 시간 형식 검증 및 자동 포맷팅

### components/MiniCalendar.jsx
- **역할**: 작은 달력 표시 컴포넌트
- **기능**:
  - 현재 월의 달력 표시
  - 오늘 날짜 하이라이트
  - 일정이 있는 날짜 표시

### hooks/useLocalStorage.js
- **역할**: 로컬 스토리지 관리 커스텀 훅
- **기능**:
  - 일정 데이터 자동 저장/로드
  - JSON 직렬화/역직렬화 처리
  - 초기값 설정 및 에러 핸들링

## 🏃‍♂️ 시작하기

### 전제 조건
- Node.js 16+ 
- npm 또는 yarn

### 설치
```bash
cd my-scheduler-app
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 으로 접속

### 빌드
```bash
npm run build
```

## 🚀 사용법

1. **일정 추가**: 
   - 캘린더에서 원하는 날짜를 클릭하여 일정 추가 모달 열기
   - 또는 날짜 셀을 우클릭하여 컨텍스트 메뉴에서 "새 일정 추가" 선택
2. **일정 보기**: 날짜를 클릭하면 해당 날짜의 모든 일정이 사이드바에 표시
3. **일정 수정**: 
   - 사이드바의 일정 카드에서 수정 버튼 클릭
   - 또는 캘린더의 일정을 우클릭하여 컨텍스트 메뉴에서 "수정" 선택
4. **일정 삭제**: 
   - 사이드바의 일정 카드에서 삭제 버튼 클릭
   - 또는 캘린더의 일정을 우클릭하여 컨텍스트 메뉴에서 "삭제" 선택
5. **세부 내용**: 일정 카드를 클릭하여 전체 내용 보기/숨기기
6. **키보드 사용**: 시간 입력 시 Enter 키로 다음 필드 이동
7. **컨텍스트 메뉴**: 우클릭 메뉴 활성화 시 다른 모든 상호작용이 차단되어 안정적인 사용 경험

