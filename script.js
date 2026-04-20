document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar & Smart Scroll
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Apply blur effect if scrolled past 50px
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Smart hide/show logic
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            // Scrolling down and past the navbar height -> hide
            navbar.classList.add('hidden');
        } else {
            // Scrolling up or at the very top -> show
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    });

    // 2. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 3. Modals
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const closeButtons = document.querySelectorAll('.close-modal');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.style.display = 'flex';
                setTimeout(() => targetModal.classList.add('show'), 10);
                document.body.style.overflow = 'hidden';
            }
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal(e.target);
    });

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // 4. Custom 3D Tilt Effect System
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse X inside card
            const y = e.clientY - rect.top; // Mouse Y inside card
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const maxTilt = 15; // Max 15 degree rotation
            
            // Calculate rotation percentages
            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            
            // Neon Glow effect following mouse
            if (card.classList.contains('glass') || card.classList.contains('bird-card')) {
                const glowX = (x / rect.width) * 100;
                const glowY = (y / rect.height) * 100;
                card.style.backgroundImage = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0, 229, 255, 0.15), transparent 50%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            // Reset to default
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            if (card.classList.contains('glass') || card.classList.contains('bird-card')) {
                card.style.backgroundImage = 'none';
            }
        });
    });

    // 5. Slider Logic & Main Controller Updates
    const speedSlider = document.getElementById('speed-slider');
    const sizeSlider = document.getElementById('size-slider');
    const speedLabel = document.getElementById('speed-label');
    const sizeLabel = document.getElementById('size-label');

    function updateSliderParams(slider, labelElement) {
        if (!slider) return;
        const val = slider.value;
        slider.parentElement.style.setProperty('--val', `${val}%`);
        
        let label = "Standard";
        const player = document.getElementById('main-lottie-player');

        if (slider.id === 'speed-slider') {
            if (val < 33) label = "Slow";
            else if (val > 66) label = "Fast";
            else label = "Standard";
            
            // Update Main Player Speed (val 1 to 100 -> speed 0.2 to 2.0)
            if (player) {
                const speedScale = Math.max(0.2, val / 50);
                // Method call or attribute set
                if(typeof player.setSpeed === 'function') player.setSpeed(speedScale);
                player.setAttribute('speed', speedScale);
            }
        } else if (slider.id === 'size-slider') {
            if (val < 33) label = "Small";
            else if (val > 66) label = "Large";
            else label = "Optimal";
            
            // Update Main Player Size/Scale (val 1 to 100 -> scale 0.5 to 1.5)
            if (player) {
                const sizeScale = 0.5 + (val / 100);
                player.style.transform = `scale(${sizeScale})`;
            }
        }
        if(labelElement) labelElement.textContent = label;
    }

    if (speedSlider) speedSlider.addEventListener('input', () => updateSliderParams(speedSlider, speedLabel));
    if (sizeSlider) sizeSlider.addEventListener('input', () => updateSliderParams(sizeSlider, sizeLabel));

    // 6. Bird Selection Logic
    const birdCards = document.querySelectorAll('.bird-card');
    
    birdCards.forEach(card => {
        card.addEventListener('click', () => {
            // If it's locked, don't change
            if(card.classList.contains('locked')) {
                alert('This premium character is locked. Purchase to unlock.');
                return;
            }
            
            // Remove active from all
            birdCards.forEach(c => {
                c.classList.remove('active');
                let activeTxt = c.querySelector('.active-text');
                if (activeTxt) activeTxt.remove();
            });
            
            // Add active to clicked card
            card.classList.add('active');
            const h4 = card.querySelector('h4');
            if(h4 && !card.querySelector('.active-text')) {
                const txt = document.createElement('div');
                txt.className = 'active-text';
                txt.innerText = 'ACTIVE';
                card.appendChild(txt);
            }
            
            // Update Main Controller Lottie File
            const previewPlayer = card.querySelector('lottie-player');
            const targetContainer = document.getElementById('main-lottie-player')?.parentElement;
            
            if(previewPlayer && targetContainer) {
                const newSrc = previewPlayer.getAttribute('src');
                
                // Get current states
                const currentSpeedSlider = document.getElementById('speed-slider');
                const speedVal = currentSpeedSlider ? Math.max(0.2, currentSpeedSlider.value / 50) : 1;
                
                const currentSizeSlider = document.getElementById('size-slider');
                const sizeVal = currentSizeSlider ? 0.5 + (currentSizeSlider.value / 100) : 1;

                // Re-inject entirely to guarantee fresh load and rendering
                targetContainer.innerHTML = `
                    <lottie-player 
                        id="main-lottie-player" 
                        src="${newSrc}" 
                        background="transparent" 
                        speed="${speedVal}" 
                        style="width: 100%; height: 200px; transition: transform 0.2s; transform: scale(${sizeVal});" 
                        loop autoplay>
                    </lottie-player>`;
                
                // Scroll to controller so user sees effect immediately
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        });
    });

    // 7. QR generation + Mobile-detection for APK download
    (function setupApkDownloadUX(){
        const apkPath = '/app-release.apk?v=2.0';
        const fullUrl = `${window.location.origin}${apkPath}`;

        const qrImg = document.getElementById('apk-qr');
        const qrContainer = document.getElementById('qr-container');
        const qrInstruction = document.getElementById('qr-instruction');
        const downloadBtn = document.getElementById('download-apk-btn');
        const mobileInstruction = document.getElementById('mobile-instruction');

        const isMobile = /Mobi|Android/i.test(navigator.userAgent) || (('ontouchstart' in window) && navigator.maxTouchPoints > 0);

        if(qrImg){
            if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                const qrUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + encodeURIComponent(fullUrl);
                qrImg.src = qrUrl;
                // fallback to another public QR provider if Google Chart image fails
                qrImg.onerror = function(){
                    const fallback = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(fullUrl);
                    qrImg.onerror = null;
                    qrImg.src = fallback;
                };
            } else {
                // page opened via file:// — QR can't reference a device-accessible URL
                qrImg.style.display = 'none';
                if (qrInstruction) qrInstruction.textContent = 'QR unavailable when opening the file directly. Run a local server (see instructions) and reload.';
            }
        }

        if(isMobile){
            // On mobile prefer the download button. Hide large QR.
            if(qrContainer) qrContainer.style.display = 'none';
            if(downloadBtn) downloadBtn.style.display = 'inline-block';
            if(mobileInstruction) {
                mobileInstruction.innerHTML = 'Tap the button to download. <br><br><span style="color:#ffcc00;">⚠️ <strong>IMPORTANT:</strong> Once the APK is downloaded, go to <strong>Google Play Store ➔ Settings</strong> and <strong>Turn OFF Play Protect</strong>. After that, open your File Manager\'s Download section and tap the APK to install it (allow "Unknown Sources" if prompted).</span>';
            }
        } else {
            // Desktop: show QR prominently and keep download link as alternate option.
            if(qrContainer) qrContainer.style.display = 'inline-block';
            if(downloadBtn) downloadBtn.style.display = 'inline-block';
            if(qrInstruction) qrInstruction.textContent = 'Scan this QR code with your phone to download the APK directly.';
            if(mobileInstruction) {
                mobileInstruction.innerHTML = 'Scan the QR or use the download link to save the APK to your PC. <br><br><span style="color:#ffcc00;">⚠️ <strong>IMPORTANT:</strong> Before installing on your phone, go to <strong>Google Play Store ➔ Settings</strong> and <strong>Turn OFF Play Protect</strong>. Then copy the APK and install it.</span>';
            }
        }
    })();

    // 8. Make any element with `.start-apk-download` trigger APK download immediately
    (function attachApkDownloadHandlers(){
        const triggers = document.querySelectorAll('.start-apk-download');
        if(!triggers || triggers.length === 0) return;

        triggers.forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();

                // prefer absolute origin when served over http/https
                let downloadUrl = 'app-release.apk?v=2.0';
                try {
                    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                        downloadUrl = window.location.origin + '/app-release.apk?v=2.0';
                    }
                } catch (err) {
                    downloadUrl = 'app-release.apk?v=2.0';
                }

                // --- FIREBASE TRACKING ---
                if (typeof window.trackApkDownload === 'function') {
                    window.trackApkDownload();
                }

                // create temporary anchor to trigger download
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.type = 'application/vnd.android.package-archive';
                a.download = 'app-release.apk';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
        });
    })();
});
