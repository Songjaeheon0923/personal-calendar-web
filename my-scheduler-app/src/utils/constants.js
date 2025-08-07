// PropTypes 대체 - 개발 모드에서만 동작하는 간단한 타입 체크
export const validateProps = (props, propTypes, componentName) => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return;
  
  Object.keys(propTypes).forEach(key => {
    const validator = propTypes[key];
    const value = props[key];
    
    try {
      const result = validator(value, key, componentName);
      if (result) {
        console.warn(`Warning: ${componentName}: ${result}`);
      }
    } catch (error) {
      console.error(`PropType validation error in ${componentName}:`, error);
    }
  });
};

// 기본 타입 검증자들
export const PropTypes = {
  string: (value, key) => {
    if (value !== undefined && typeof value !== 'string') {
      return `${key} should be a string`;
    }
  },
  
  number: (value, key) => {
    if (value !== undefined && typeof value !== 'number') {
      return `${key} should be a number`;
    }
  },
  
  bool: (value, key) => {
    if (value !== undefined && typeof value !== 'boolean') {
      return `${key} should be a boolean`;
    }
  },
  
  func: (value, key) => {
    if (value !== undefined && typeof value !== 'function') {
      return `${key} should be a function`;
    }
  },
  
  object: (value, key) => {
    if (value !== undefined && (typeof value !== 'object' || value === null)) {
      return `${key} should be an object`;
    }
  },
  
  array: (value, key) => {
    if (value !== undefined && !Array.isArray(value)) {
      return `${key} should be an array`;
    }
  },
  
  instanceOf: (expectedClass) => (value, key) => {
    if (value !== undefined && !(value instanceof expectedClass)) {
      return `${key} should be an instance of ${expectedClass.name}`;
    }
  },
  
  oneOf: (expectedValues) => (value, key) => {
    if (value !== undefined && !expectedValues.includes(value)) {
      return `${key} should be one of: ${expectedValues.join(', ')}`;
    }
  },
  
  arrayOf: (elementValidator) => (value, key) => {
    if (value !== undefined) {
      if (!Array.isArray(value)) {
        return `${key} should be an array`;
      }
      
      for (let i = 0; i < value.length; i++) {
        const result = elementValidator(value[i], `${key}[${i}]`);
        if (result) return result;
      }
    }
  }
};

// 필수 prop 검증자
PropTypes.isRequired = (validator) => (value, key) => {
  if (value === undefined || value === null) {
    return `${key} is required`;
  }
  return validator ? validator(value, key) : undefined;
};

// 스케줄 데이터 타입 정의
export const ScheduleType = {
  id: PropTypes.isRequired(PropTypes.number),
  title: PropTypes.isRequired(PropTypes.string),
  date: PropTypes.isRequired(PropTypes.string),
  endDate: PropTypes.string,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  color: PropTypes.string,
  memo: PropTypes.string
};

// 이벤트 데이터 타입 정의
export const EventType = {
  id: PropTypes.isRequired(PropTypes.number),
  title: PropTypes.isRequired(PropTypes.string),
  start: PropTypes.isRequired(PropTypes.instanceOf(Date)),
  end: PropTypes.isRequired(PropTypes.instanceOf(Date)),
  color: PropTypes.string,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
  resource: PropTypes.object,
  allDay: PropTypes.bool
};

// 컨텍스트 메뉴 타입 정의
export const ContextMenuType = {
  show: PropTypes.isRequired(PropTypes.bool),
  x: PropTypes.number,
  y: PropTypes.number,
  event: PropTypes.object,
  date: PropTypes.instanceOf(Date)
};