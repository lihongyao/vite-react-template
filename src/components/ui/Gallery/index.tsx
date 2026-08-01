import { useMemo } from 'react';

import Lightbox from 'yet-another-react-lightbox';
import type { LightboxExternalProps, Plugin, Slide, SlideImage } from 'yet-another-react-lightbox';
import Download from 'yet-another-react-lightbox/plugins/download';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import 'yet-another-react-lightbox/styles.css';

export type GalleryProps = Omit<LightboxExternalProps, 'close'> & {
  close: (open: boolean) => void;
};
export type GallerySlide = Slide;
export type GalleryImageSlide = SlideImage;
export type GalleryDownloadHandler = NonNullable<NonNullable<GalleryProps['download']>['download']>;

const requiredPlugins: readonly Plugin[] = [Zoom, Download];

export default function Gallery({ close, plugins, ...lightboxProps }: GalleryProps) {
  const resolvedPlugins = useMemo(
    () => Array.from(new Set<Plugin>([...requiredPlugins, ...(plugins ?? [])])),
    [plugins],
  );

  return <Lightbox {...lightboxProps} close={() => close(false)} plugins={resolvedPlugins} />;
}
