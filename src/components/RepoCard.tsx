/**
 * RepoCard - Individual repository card component.
 *
 * Renders a single repository with:
 *  - Deploy type badge (Cloudflare / Other / Release / Repository)
 *  - Visibility badge (Private lock icon)
 *  - Language tag with colour coding
 *  - Action buttons (Visit Site / View Code / Download Release)
 *  - Description with hover tooltip for overflowing text
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Cloud,
  Globe,
  Archive,
  Download,
  ExternalLink,
  Lock,
  Calendar,
} from 'lucide-react';
import type { Repository } from '../types';

// ── Helpers ─────────────────────────────────────────────────────────

function getLanguageClass(lang: string): string {
  if (!lang) return 'lang-na';
  const l = lang.toLowerCase();
  if (l === 'typescript') return 'lang-typescript';
  if (l === 'javascript') return 'lang-javascript';
  if (l === 'rust') return 'lang-rust';
  if (l === 'java') return 'lang-java';
  if (l === 'html') return 'lang-html';
  if (l === 'css') return 'lang-css';
  if (l === 'python') return 'lang-python';
  return 'lang-other';
}

// ── Sub-component: description tooltip ──────────────────────────────

function DescriptionTooltip({ text }: { text: string }) {
  const pRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimeout = useRef<number | null>(null);

  useEffect(() => {
    const el = pRef.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  const handleMouseEnter = useCallback(() => {
    if (!isClamped) return;
    if (hideTimeout.current) { clearTimeout(hideTimeout.current); hideTimeout.current = null; }
    setShowTooltip(true);
  }, [isClamped]);

  const handleMouseLeave = useCallback(() => {
    hideTimeout.current = window.setTimeout(() => setShowTooltip(false), 150);
  }, []);

  const handleTooltipEnter = useCallback(() => {
    if (hideTimeout.current) { clearTimeout(hideTimeout.current); hideTimeout.current = null; }
  }, []);

  return (
    <div className="desc-wrapper">
      <p
        ref={pRef}
        className={`card-description ${isClamped ? 'clamped' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </p>
      {showTooltip && (
        <div
          className="desc-tooltip"
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {text}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────

interface RepoCardProps {
  repo: Repository;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const displayLang = repo.language && repo.language !== 'null' ? repo.language : 'N/A';
  const langClass = getLanguageClass(repo.language);

  // Deploy badge
  let deployBadge: React.ReactNode = null;
  let visitBtn: React.ReactNode = null;

  if (repo.deploy_type === 'cloudflare') {
    deployBadge = (
      <span className="deploy-badge cf-badge">
        <Cloud size={12} /> Cloudflare
      </span>
    );
    visitBtn = (
      <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="btn btn-cf">
        <ExternalLink size={14} /> Visit Site
      </a>
    );
  } else if (repo.deploy_type === 'other') {
    deployBadge = (
      <span className="deploy-badge oth-badge">
        <Globe size={12} /> Deployed
      </span>
    );
    visitBtn = (
      <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="btn btn-other">
        <ExternalLink size={14} /> Visit Site
      </a>
    );
  } else if (repo.release_url) {
    deployBadge = (
      <span className="deploy-badge release-badge">
        <Download size={12} /> Release
      </span>
    );
    visitBtn = (
      <a href={repo.release_url} target="_blank" rel="noopener noreferrer" className="btn btn-release">
        <Download size={14} /> Get {repo.release_tag}
      </a>
    );
  } else {
    deployBadge = (
      <span className="deploy-badge none-badge">
        <Archive size={12} /> Repository
      </span>
    );
  }

  return (
    <article className={`repo-card ${repo.deploy_type} ${repo.visibility === 'private' ? 'repo-card--private' : ''}`}>
      <div className="card-header">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-title"
          title="GitHubで開く"
        >
          {repo.name}
        </a>
        <div className="card-badges">
          {repo.visibility === 'private' && (
            <span className="deploy-badge private-badge">
              <Lock size={11} /> Private
            </span>
          )}
          {deployBadge}
        </div>
      </div>
      <div className="card-meta">
        <span className={`lang-tag ${langClass}`}>{displayLang}</span>
        <span className="date-tag" title="Last updated">
          <Calendar size={12} /> {repo.updated_at}
        </span>
      </div>
      <DescriptionTooltip text={repo.description} />
      <div className="card-actions">
        {visitBtn}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          View Code
        </a>
      </div>
    </article>
  );
}
