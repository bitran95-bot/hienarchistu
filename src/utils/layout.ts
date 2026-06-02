export const MAX_ROW_WIDTH = 30; // Max width per row before wrapping
export const ITEM_SPACING = 1.5;  // Minimum spacing between items

export function calculateProjectLayout(projects: any[]) {
  if (!projects || projects.length === 0) return [];
  
  const photoProjects = projects.filter((p: any) => !p.modelFileUrl);
  const modelProjects = projects.filter((p: any) => p.modelFileUrl);
  
  const layout: any[] = [];
  let r = 0;
  let currentX = 0;

  const processProjects = (projs: any[]) => {
    projs.forEach((p: any) => {
      let expectedWidth = 2.5; // fallback width
      
      if (p.modelFileUrl) {
        const modelScale = p.modelScale || 1;
        // SplineModel maxDim = 2.4 * 0.8 * modelScale = 1.92 * modelScale
        // InteractiveProject scales by 1.95 on hover
        const maxPossibleWidth = 1.92 * modelScale * 1.95;
        expectedWidth = maxPossibleWidth + 1.5; // padding
      } else if (p.image?.asset?._ref) {
        let aspect = 2.2 / 1.4;
        const match = p.image.asset._ref.match(/-(\d+)x(\d+)-/);
        if (match) {
          const w = parseInt(match[1], 10);
          const h = parseInt(match[2], 10);
          if (w && h) {
             aspect = w / h;
          }
        }
        // FallbackPhotoFrame base width = 1.4 * aspect (no more frame border)
        // InteractiveProject scales by 1.95 on hover
        const actualWidth = (1.4 * aspect) * 1.95;
        expectedWidth = actualWidth + 1.5; // padding
      }
      
      // If adding this item exceeds row width, wrap to next line
      if (currentX + expectedWidth > MAX_ROW_WIDTH && currentX > 0) {
        r++;
        currentX = 0;
      }
      
      // Center position of the item
      const xPos = currentX + expectedWidth / 2;
      
      layout.push({
        ...p,
        computedX: xPos,
        computedRow: r,
        expectedWidth
      });
      
      // Advance cursor for next item
      currentX += expectedWidth + ITEM_SPACING;
    });
    
    // Always wrap after a category finishes if there was anything placed
    if (currentX > 0) {
      r++;
      currentX = 0;
    }
  };

  processProjects(photoProjects);
  processProjects(modelProjects);
  
  return layout;
}
