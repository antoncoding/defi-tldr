import React from 'react';

interface Heading {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  headings: Heading[];
  activeId: string | null;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, activeId }) => {
  // Filter for H1, H2, H3 only, including the manually added "introduction"
  const filteredHeadings = headings.filter(h => h.level <= 3 || h.id === 'introduction');

  if (!filteredHeadings || filteredHeadings.length < 2) { // Only show if there's more than just the intro
    return null;
  }

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        // Calculate offset if needed (e.g., for fixed header)
        const offset = 80; // Adjust as needed (scroll-mt-20 is 5rem = 80px)
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        // Update URL hash without page jump
        // window.history.pushState(null, '', `#${id}`);
    }
  };

  // Find if sources link should be shown
  const showSourcesLink = headings.some(h => h.id === 'sources');
  // Get headings specifically for the 'Summary' section (exclude intro and sources)
  const summaryHeadings = headings.filter(h => h.id !== 'introduction' && h.id !== 'sources');

  // Only render if there's TLDR or Sources or Summary headings
  if (summaryHeadings.length === 0 && !showSourcesLink) {
      return null; // Or potentially show just TLDR if always desired
  }

  return (
    <nav className="fixed top-28 right-24 w-60 hidden xl:block text-sm z-10"> {/* Show on xl screens */}
      {/* <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        On this page
      </p> */}
      {/* Removed the "On this page" title as the structure is now clearer */}
      <ul className="space-y-1 text-slate-600 dark:text-slate-400">
        {/* --- TLDR Section --- */}
        <li>
          <a
            href="#introduction" 
            onClick={(e) => handleSmoothScroll(e, 'introduction')}
            className={`block border-l-2 py-1 transition-all duration-200 ease-in-out pl-3 font-medium
              ${activeId === 'introduction'
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            TLDR
          </a>
        </li>

        {/* --- Summary Section Link --- */}
        <li>
          <a
            href="#summary-content"
            onClick={(e) => handleSmoothScroll(e, 'summary-content')}
            className={`block border-l-2 py-1 transition-all duration-200 ease-in-out pl-3 font-medium
              ${summaryHeadings.length > 0 && activeId === summaryHeadings[0].id ? 'border-teal-500 text-teal-600 dark:text-teal-400' : /* Highlight Summary if first heading is active? Needs refinement */
                 activeId === 'summary-content' ? 'border-teal-500 text-teal-600 dark:text-teal-400' :
                 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
              }
            `}
          >
            Summary
          </a>
        </li>

        {/* --- Summary Section (Generated Headings) --- */}
        {summaryHeadings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleSmoothScroll(e, heading.id)}
              className={`block border-l-2 py-1 transition-all duration-200 ease-in-out
                ${activeId === heading.id
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400 font-medium'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
                }
                ${heading.level === 1 ? 'pl-6' : /* Should ideally not happen here now */
                  heading.level === 2 ? 'pl-6' : 
                  'pl-9' /* Level 3 */
                }
              `}
            >
              {heading.text}
            </a>
          </li>
        ))}

        {/* --- Sources Section --- */}
        {showSourcesLink && (
           <li>
            <a
              href="#sources"
              onClick={(e) => handleSmoothScroll(e, 'sources')}
              className={`block border-l-2 py-1 transition-all duration-200 ease-in-out pl-3 font-medium
                ${activeId === 'sources'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              Sources
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default TableOfContents; 