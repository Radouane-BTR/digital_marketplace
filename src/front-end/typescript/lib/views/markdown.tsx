import { fileBlobPath, prefixPath } from 'front-end/lib';
import { View } from 'front-end/lib/framework';
import isRelativeUrl from 'is-relative-url';
import React from 'react';

import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import ReactMarkdown from 'react-markdown';
import { decodeMarkdownImageUrlToFileId } from 'shared/lib/resources/file';
import i18next from "i18next";

interface Props {
  source: string;
  box?: boolean;
  className?: string;
  escapeHtml?: boolean;
  openLinksInNewTabs?: boolean;
  smallerHeadings?: boolean;
  noImages?: boolean;
  noLinks?: boolean;
}

const MAILTO_REGEXP = /^mailto:/i;

function isHashLink(url: string): boolean {
  return url.charAt(0) === '#';
}

function newTabLinkTarget(url: string): string | undefined {
  if (isRelativeUrl(url) || url.match(MAILTO_REGEXP) || isHashLink(url)) {
    return undefined;
  } else {
    return '_blank';
  }
}

function headingLevelToClassName(level: number): string {
  switch (level) {
    case 1: return 'h4';
    case 2: return 'h5';
    default: return 'h6';
  }
}

function decodeImgSrc(src: string): string {
  const decoded = decodeMarkdownImageUrlToFileId(src);
  return decoded ? fileBlobPath({ id: decoded }) : src;
}

const Markdown: View<Props> = ({ source, box, className = '', escapeHtml = true, openLinksInNewTabs = false, smallerHeadings = false, noImages = false, noLinks = false }) => {
  const renderers = {
    a: noLinks
      ? () => { //React-Markdown types are not helpful here.
        return (<span className='text-danger font-weight-bold'>[{i18next.t('linkRedacted')}]</span>);
      }
      : (props: any) => {
        const href = isRelativeUrl(props.href) && !isHashLink(props.href) ? prefixPath(props.href) : props.href;
        return (<a
          {...props}
          href={href}
          rel='external'
          target={openLinksInNewTabs ? newTabLinkTarget(props.href) : props.target} />);
      },
    img: noImages
      ? () => { //React-Markdown types are not helpful here.
        return (<span className='text-danger font-weight-bold'>[{i18next.t('imageRedacted')}]</span>);
      }
      : (props: any) => {
        return (<img {...props} src={decodeImgSrc(props.src || '')} />);
      },
    '§': smallerHeadings
      ? ({ level, children }: any) => { //React-Markdown types are not helpful here.
        return (<div className={`${headingLevelToClassName(level)} text-secondary`} children={children} />);
      }
      : undefined
  };
  const rehypePlugins = escapeHtml ? [rehypeRaw, rehypeSanitize] : undefined
  return (
    <div className={`markdown ${box ? 'p-4 bg-light border rounded' : ''} ${className}`}>
      <ReactMarkdown
        rehypePlugins={rehypePlugins}
        {...renderers}>
        {source}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;

type ProposalMarkdownProps = Pick<Props, 'source' | 'className' | 'box' | 'noLinks' | 'noImages'>;

export const ProposalMarkdown: View<ProposalMarkdownProps> = props => {
  return (
    <Markdown
      openLinksInNewTabs
      smallerHeadings
      noLinks
      noImages
      {...props} />
  );
};
