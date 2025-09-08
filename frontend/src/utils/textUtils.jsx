/**
 * 텍스트 내 URL을 자동으로 클릭 가능한 링크로 변환하는 함수
 * @param {string} text - 변환할 텍스트 콘텐츠
 * @returns {JSX.Element[]} JSX 요소 배열
 */
export const renderContentWithLinks = (text) => {
  if (!text) return null;
  
  // URL 패턴 정규식 (http, https, www 포함)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  // 텍스트를 줄바꿈으로 분할
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const parts = line.split(urlRegex);
    
    return (
      <div key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
        {parts.map((part, partIndex) => {
          if (urlRegex.test(part)) {
            // URL인 경우 링크로 변환
            const href = part.startsWith('http') ? part : `https://${part}`;
            return (
              <a
                key={partIndex}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          } else {
            // 일반 텍스트
            return <span key={partIndex}>{part}</span>;
          }
        })}
      </div>
    );
  });
};
