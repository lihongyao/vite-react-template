type BodyStyles = {
  position: string;
  top: string;
  width: string;
  overflow: string;
};

let lockCount = 0;
let scrollY = 0;
let previousHtmlOverflow = '';
let previousBodyStyles: BodyStyles | null = null;
let previousScrollLockedAttribute: string | null = null;

export function lockDocumentScroll() {
  lockCount += 1;
  if (lockCount !== 1) return;

  scrollY = window.scrollY;
  previousHtmlOverflow = document.documentElement.style.overflow;
  previousScrollLockedAttribute = document.body.getAttribute('data-scroll-locked');
  previousBodyStyles = {
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
    overflow: document.body.style.overflow,
  };

  document.documentElement.style.overflow = 'hidden';
  document.body.setAttribute('data-scroll-locked', 'true');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
}

export function unlockDocumentScroll() {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount !== 0 || previousBodyStyles === null) return;

  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.position = previousBodyStyles.position;
  document.body.style.top = previousBodyStyles.top;
  document.body.style.width = previousBodyStyles.width;
  document.body.style.overflow = previousBodyStyles.overflow;
  if (previousScrollLockedAttribute === null) {
    document.body.removeAttribute('data-scroll-locked');
  } else {
    document.body.setAttribute('data-scroll-locked', previousScrollLockedAttribute);
  }
  window.scrollTo(0, scrollY);
  previousBodyStyles = null;
  previousScrollLockedAttribute = null;
}
