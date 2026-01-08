
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("show");
}

document.addEventListener('DOMContentLoaded', function() {
    
    const container = document.getElementById('navContainer');
    const navList = document.getElementById('navList');
    const filter = document.getElementById('filter');
    const text = document.getElementById('text');
    
    
    const config = {
        animationTime: 600,
        particleCount: 15,
        particleDistances: [90, 10],
        particleR: 100,
        timeVariance: 300,
        colors: [1, 2, 3, 1, 2, 3, 1, 4],
        initialActiveIndex: 0
    };
    
    
    const items = [
  { label: 'login-page-design', href: 'login-page-design' },
  { label: 'landing-page-design', href: 'landing-page-design' },
  { label: 'dashboard-ui', href: 'dashboard-ui' },
  { label: 'pricing-page', href: 'pricing-page' },
  { label: '404-page-design', href: '404-page-design' }
];

    
    
    let activeIndex = config.initialActiveIndex;
    
    
    const noise = (n = 1) => n / 2 - Math.random() * n;
    
    const getXY = (distance, pointIndex, totalPoints) => {
        const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
        return [distance * Math.cos(angle), distance * Math.sin(angle)];
    };
    
    const createParticle = (i, t, d, r) => {
        let rotate = noise(r / 10);
        return {
            start: getXY(d[0], config.particleCount - i, config.particleCount),
            end: getXY(d[1] + noise(7), config.particleCount - i, config.particleCount),
            time: t,
            scale: 1 + noise(0.2),
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
        };
    };
    
    const makeParticles = element => {
        const d = config.particleDistances;
        const r = config.particleR;
        const bubbleTime = config.animationTime * 2 + config.timeVariance;
        element.style.setProperty('--time', `${bubbleTime}ms`);
        
        const existingParticles = element.querySelectorAll('.particle');
        existingParticles.forEach(p => element.removeChild(p));
        
        for (let i = 0; i < config.particleCount; i++) {
            const t = config.animationTime * 2 + noise(config.timeVariance * 2);
            const p = createParticle(i, t, d, r);
            element.classList.remove('active');
            
            setTimeout(() => {
                const particle = document.createElement('span');
                const point = document.createElement('span');
                particle.classList.add('particle');
                particle.style.setProperty('--start-x', `${p.start[0]}px`);
                particle.style.setProperty('--start-y', `${p.start[1]}px`);
                particle.style.setProperty('--end-x', `${p.end[0]}px`);
                particle.style.setProperty('--end-y', `${p.end[1]}px`);
                particle.style.setProperty('--time', `${p.time}ms`);
                particle.style.setProperty('--scale', `${p.scale}`);
                particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
                particle.style.setProperty('--rotate', `${p.rotate}deg`);
                
                point.classList.add('point');
                particle.appendChild(point);
                element.appendChild(particle);
                requestAnimationFrame(() => {
                    element.classList.add('active');
                });
                setTimeout(() => {
                    try {
                        element.removeChild(particle);
                    } catch {
                    }
                }, t);
            }, 30);
        }
    };
    
    const updateEffectPosition = element => {
        if (!container || !filter || !text) return;
        const containerRect = container.getBoundingClientRect();
        const pos = element.getBoundingClientRect();
        
        const styles = {
            left: `${pos.x - containerRect.x}px`,
            top: `${pos.y - containerRect.y}px`,
            width: `${pos.width}px`,
            height: `${pos.height}px`
        };
        Object.assign(filter.style, styles);
        Object.assign(text.style, styles);
        text.innerText = element.innerText;
    };
    
    const handleClick = (e, index) => {
  e.preventDefault(); // مهم جدًا لمنع إعادة التحميل

  // Show related content
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(items[index].href);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  const liEl = e.currentTarget;
  if (activeIndex === index) return;

  activeIndex = index;

  const allLi = navList.querySelectorAll('li');
  allLi.forEach((li, i) => {
      if (i === activeIndex) {
          li.classList.add('active');
      } else {
          li.classList.remove('active');
      }
  });

  updateEffectPosition(liEl);

  const particles = filter.querySelectorAll('.particle');
  particles.forEach(p => filter.removeChild(p));

  text.classList.remove('active');
  void text.offsetWidth; 
  text.classList.add('active');

  makeParticles(filter);
};

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const liEl = e.currentTarget.parentElement;
            if (liEl) {
                handleClick({ currentTarget: liEl }, index);
            }
        }
    };
    
    const initNav = () => {
        navList.innerHTML = '';
        
        items.forEach((item, index) => {
            const li = document.createElement('li');
            if (index === activeIndex) {
                li.classList.add('active');
            }
            
            const a = document.createElement('a');
            a.href = item.href;
            a.textContent = item.label;
            a.addEventListener('click', (e) => handleClick(e, index));
            a.addEventListener('keydown', (e) => handleKeyDown(e, index));
            
            li.appendChild(a);
            navList.appendChild(li);
        });
        
        const activeLi = navList.querySelectorAll('li')[activeIndex];
        if (activeLi) {
            updateEffectPosition(activeLi);
            text.classList.add('active');
        }
    };
    
    const resizeObserver = new ResizeObserver(() => {
        const currentActiveLi = navList.querySelectorAll('li')[activeIndex];
        if (currentActiveLi) {
            updateEffectPosition(currentActiveLi);
        }
    });
    
    initNav();
    resizeObserver.observe(container);
});