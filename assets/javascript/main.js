// Manejo de la barra de navegación: ocultar al hacer scroll hacia abajo, mostrar al subir
(function() {
	const header = document.querySelector('header');
	let lastScroll = globalThis.pageYOffset || document.documentElement.scrollTop;
	let ticking = false;

	function onScroll() {
		const current = window.pageYOffset || document.documentElement.scrollTop;
		if (Math.abs(current - lastScroll) < 10) { // pequeño umbral para evitar saltos
			return;
		}

		if (current > lastScroll && current > 120) {
			// scrolldown -> ocultar
			header.classList.add('hidden');
			header.classList.remove('scrolled');
		} else {
			// scroll up -> mostrar
			header.classList.remove('hidden');
			header.classList.add('scrolled');
		}

		lastScroll = Math.max(0, current); // reset al top
		ticking = false;
	}

	globalThis.addEventListener('scroll', function() {
		if (!ticking) {
			globalThis.requestAnimationFrame(onScroll);
			ticking = true;
		}
	}, { passive: true });
})();

// Scroll-spy: marcar enlace activo según sección visible
(function() {
	const navLinks = document.querySelectorAll('nav a');
	const sections = Array.from(document.querySelectorAll('main section[id]'));
	if (!navLinks.length || !sections.length) return;

	const linkById = {};
	for (const a of navLinks) {
		const href = a.getAttribute('href');
		if (href?.startsWith('#')) {
			linkById[href.slice(1)] = a;
		}
	}

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			const id = entry.target.id;
			const link = linkById[id];
			if (!link) continue;
			if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
				link.classList.add('active');
			} else {
				link.classList.remove('active');
			}
		}
	}, { root: null, rootMargin: '0px', threshold: [0.45, 0.6] });

	for (const s of sections) observer.observe(s);
})();

// Carousel autoplay + center active slide
(function() {
	const carousel = document.querySelector('.carousel');
	if (!carousel) return;
	const slidesContainer = carousel.querySelector('.slides');
	const originalSlides = Array.from(carousel.querySelectorAll('.slide'));
	const n = originalSlides.length;
	if (n === 0) return;

	// create clones for infinite effect
	for (let i = 0; i < n; i++) {
		const clone = originalSlides[i].cloneNode(true);
		slidesContainer.appendChild(clone);
	}
	for (let i = n - 1; i >= 0; i--) {
		const clone = originalSlides[i].cloneNode(true);
		slidesContainer.insertBefore(clone, slidesContainer.firstChild);
	}

	const slides = Array.from(slidesContainer.querySelectorAll('.slide'));
	const offset = n; // index of the first original slide inside slides[]
	let logical = 0; // logical index within 0..n-1
	let interval = null;

	function domIndexFor(logicalIndex) {
		return offset + ((logicalIndex % n) + n) % n;
	}

	function updateActive(logicalIndex) {
		logical = ((logicalIndex % n) + n) % n;
		const domIndex = domIndexFor(logical);
		for (let i = 0; i < slides.length; i++) {
			slides[i].classList.toggle('active', i === domIndex);
		}

		// center the DOM element at domIndex
		const slide = slides[domIndex];
		const containerWidth = carousel.clientWidth;
		const slideOffset = slide.offsetLeft + (slide.offsetWidth / 2);
		const translateX = slideOffset - containerWidth / 2;
		slidesContainer.style.transform = `translateX(${-translateX}px)`;
	}

	function startAutoplay() {
		stopAutoplay();
		interval = setInterval(() => updateActive(logical + 1), 3800);
	}

	function stopAutoplay() {
		if (interval) { clearInterval(interval); interval = null; }
	}

	// click to activate: map clicked DOM index back to logical index
	for (let i = 0; i < slides.length; i++) {
		slides[i].addEventListener('click', () => {
			const clickedDom = i;
			const clickedLogical = ((clickedDom - offset) % n + n) % n;
			updateActive(clickedLogical);
		});
	}

	carousel.addEventListener('mouseenter', () => stopAutoplay());
	carousel.addEventListener('mouseleave', () => startAutoplay());

	// init at logical 0
	updateActive(0);
	startAutoplay();
	globalThis.addEventListener('resize', () => updateActive(logical));
})();

// Mostrar header cuando el cursor se acerca al top en pantallas grandes
(function() {
	const header = document.querySelector('header');
	if (!header) return;
	let lastMouseInTop = false;

	function onMouseMove(e) {
		const viewportWidth = globalThis.innerWidth || document.documentElement.clientWidth;
		if (viewportWidth < 992) return; // sólo en escritorio

		const threshold = 60; // px desde el top donde se considera "cerca"
		const inTop = e.clientY <= threshold;

		if (inTop && !lastMouseInTop) {
			// entrar
			header.classList.remove('hidden');
			header.classList.add('scrolled');
		} else if (!inTop && lastMouseInTop) {
			// salir: sólo ocultar si ya se scrolleó hacia abajo
			const scrolledY = globalThis.pageYOffset || document.documentElement.scrollTop;
			if (scrolledY > 120) {
				header.classList.add('hidden');
				header.classList.remove('scrolled');
			}
		}

		lastMouseInTop = inTop;
	}

	globalThis.addEventListener('mousemove', onMouseMove, { passive: true });
})();

// Manejo del botón de descarga
(function() {
	const btn = document.getElementById('downloadNow');
	if (!btn) return;
	const url = 'https://play.google.com/store/apps/details?id=com.leroy.temipu';

	btn.addEventListener('click', function(e) {
		// abrir en nueva pestaña
		window.open(url, '_blank', 'noopener');
	});
})();

// Pequeño mejora: hacer que las screenshots sean clicables y abiertas en tamaño completo en nueva pestaña
(function() {
	const screenshots = document.querySelectorAll('.screenshots img');
	for (const img of screenshots) {
		img.style.cursor = 'pointer';
		img.addEventListener('click', () => {
			globalThis.open(img.src, '_blank', 'noopener');
		});
	}
})();

