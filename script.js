document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elements ---
    const menuScreen = document.getElementById('menu-screen');
    const questionScreen = document.getElementById('question-screen');
    const resultScreen = document.getElementById('result-screen');
    const deathScreen = document.getElementById('death-screen');
    const transitionScreen = document.getElementById('transition-screen');
    const eerieTransitionScreen = document.getElementById('eerie-transition-screen');
    const eerieTypewriterText = document.getElementById('eerie-typewriter-text');
    
    const startBtn = document.getElementById('start-btn');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const timerProgress = document.getElementById('timer-progress');
    
    const hud = document.getElementById('hud');
    const deathCountEl = document.getElementById('death-count');
    const deathMsgEl = document.getElementById('death-message');
    const wiseMessageEl = document.getElementById('wise-message');
    const skipBtn = document.getElementById('skip-btn');
    const continueBtn = document.getElementById('continue-btn');

    // Level 2 Elements
    const l2q1Screen = document.getElementById('level-2-q1-screen');
    const l2q1WrongBtns = document.querySelectorAll('.l2q1-wrong');
    const l2q1RightBtn = document.getElementById('l2q1-right');
    
    const l2q2Screen = document.getElementById('level-2-q2-screen');
    const l2q2KittenBtn = document.getElementById('l2q2-kitten');
    const l2q2BoyfriendBtn = document.getElementById('l2q2-boyfriend');

    const l2FpsScreen = document.getElementById('level-2-fps-screen');
    const targetIlayda = document.getElementById('target-ilayda');
    const targetChris = document.getElementById('target-chris');
    const crosshair = document.getElementById('crosshair');
    const gunContainer = document.querySelector('.gun-container');
    const muzzleFlash = document.getElementById('muzzle-flash');

    const l2q3Screen = document.getElementById('level-2-q3-screen');
    const sisterQText = document.getElementById('sister-q-text');
    const sisterBoxes = document.querySelectorAll('#sister-letter-boxes .letter-box');

    const l2q4Screen = document.getElementById('level-2-q4-screen');
    const chrispyQText = document.getElementById('chrispy-q-text');
    const chrispyBoxes = document.querySelectorAll('#chrispy-letter-boxes .letter-box');

    const l2q5Screen = document.getElementById('level-2-q5-screen');
    const smarterQText = document.getElementById('smarter-q-text');
    const smarterDilara = document.getElementById('smarter-dilara');
    const smarterChris = document.getElementById('smarter-chris');

    // Level 3 Elements
    const l3Screen = document.getElementById('level-3-screen');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    
    // --- Global State ---
    let currentLevel = 1;
    let deathCount = 0;
    
    // --- Evasion State ---
    let evasionActiveBtn = null;
    let evasionActiveScreen = null;
    let isShooting = false;

    // --- Level 1 State ---
    const TIMEOUT_SECONDS = 20;
    const MAX_NO_BTN_SCALE = 3.5;
    let timerInterval;
    let l4PhaseTransition = false;
    let timeRemaining = TIMEOUT_SECONDS;
    let noBtnScale = 1;

    // --- Particle System (Subtle Background) ---
    function createParticles() {
        const container = document.getElementById('particle-container');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 3 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = Math.random() > 0.5 ? '#ff007f' : '#ffffff';
            particle.style.opacity = Math.random() * 0.5;
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.boxShadow = `0 0 ${Math.random() * 10}px #ff007f`;
            
            const duration = Math.random() * 20 + 10;
            particle.style.transition = `transform ${duration}s linear`;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`;
            }, 100);
        }
    }
    createParticles();

    function typeText(element, text, speed = 100, onComplete) {
        element.innerHTML = '<span class="typewriter-cursor"></span>';
        let i = 0;
        const cursor = element.querySelector('.typewriter-cursor');
        
        function type() {
            if (i < text.length) {
                const charNode = document.createTextNode(text.charAt(i));
                element.insertBefore(charNode, cursor);
                i++;
                setTimeout(type, speed);
            } else {
                if (onComplete) onComplete();
            }
        }
        type();
    }

    // --- Screen Transitions ---
    function showScreen(screenToShow) {
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.classList.contains('active')) {
                screen.classList.remove('active');
                screen.classList.add('fade-out');
                setTimeout(() => {
                    screen.classList.remove('fade-out');
                    screen.classList.add('hidden');
                }, 1500);
            }
        });

        setTimeout(() => {
            screenToShow.classList.remove('hidden');
            setTimeout(() => {
                screenToShow.classList.add('active');
            }, 50);
        }, 1000);
    }

    // --- Death & Checkpoint System ---
    function showHUD() {
        hud.classList.remove('hidden');
    }

    function handleDeath(customMessage) {
        cleanupAllLevelListeners();
        
        deathCount++;
        deathCountEl.innerText = deathCount;
        
        // Trigger glitch animation on HUD
        const counterContainer = document.querySelector('.death-counter');
        counterContainer.classList.remove('hud-glitch');
        void counterContainer.offsetWidth; // Trigger DOM reflow
        counterContainer.classList.add('hud-glitch');

        deathMsgEl.innerHTML = customMessage;
        showScreen(deathScreen);

        // Revive at checkpoint
        setTimeout(() => {
            startLevel(currentLevel);
        }, 4000);
    }

    function winLevel(customMessage) {
        cleanupAllLevelListeners();
        
        let resultEl = document.getElementById('result-text');
        if (resultEl) {
            resultEl.innerHTML = `
                ${customMessage}<br><br>
                <div style="font-family: var(--font-heading); color: var(--neon-pink); font-size: 2.5rem; text-shadow: 0 0 20px var(--neon-pink); margin-top: 30px;">
                    LEVEL 0${currentLevel}: PASSED
                </div>
            `;
        }
        showScreen(resultScreen);
        
        setTimeout(() => {
            if (currentLevel === 3) {
                let runawayScreen = document.getElementById('final-victory-screen');
                showScreen(runawayScreen);
                setTimeout(() => {
                    let container = document.getElementById('runaway-container');
                    container.classList.remove('hidden');
                    container.classList.add('run-anim');
                    
                    setTimeout(() => {
                        currentLevel = 4;
                        startLevel(4);
                    }, 7000);
                }, 1000);
            } else if (currentLevel === 2) {
                currentLevel = 3;
                startLevel(3);
            } else if (currentLevel === 4) {
                currentLevel = 5;
                startLevel(5);
            } else {
                showScreen(transitionScreen);
            }
        }, 5000);
    }

    function cleanupAllLevelListeners() {
        clearInterval(timerInterval);
        
        // Level 1/2
        document.removeEventListener('mousemove', evadeCursor);
        document.removeEventListener('mousemove', handleFPSAiming);
        document.removeEventListener('mousedown', handleFPSClick);
        
        // Level 3
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        if (l3AnimationFrame) cancelAnimationFrame(l3AnimationFrame);
        
        // Level 4
        document.removeEventListener('keydown', l4KeyDown);
        document.removeEventListener('keyup', l4KeyUp);
        if (l4AnimationFrame) cancelAnimationFrame(l4AnimationFrame);
        
        // Level 5
        document.removeEventListener('keydown', l5KeyDown);
        document.removeEventListener('keyup', l5KeyUp);
        if (l5AnimationFrame) cancelAnimationFrame(l5AnimationFrame);
    }

    // --- Dev Skip Button ---
    skipBtn.addEventListener('click', () => {
        cleanupAllLevelListeners();
        currentLevel++;
        
        // Force hide all screens instantly to bypass transition animations
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active', 'fade-out');
            screen.classList.add('hidden');
        });
        
        startLevel(currentLevel);
    });

    document.getElementById('l4-continue-btn').addEventListener('click', () => {
        const l4Screen = document.getElementById('level-4-screen');
        const gameCanvas = document.getElementById('game-canvas');
        showScreen(l4Screen);
        
        // Show the shared canvas
        setTimeout(() => {
            gameCanvas.classList.remove('hidden');
            gameCanvas.classList.add('active');
            startLevel4Logic();
        }, 1000);
    });

    continueBtn.addEventListener('click', () => {
        currentLevel++;
        startLevel(currentLevel);
    });

    // --- Start Game / Level Router ---
    startBtn.addEventListener('click', () => {
        currentLevel = 1;
        deathCount = 0;
        deathCountEl.innerText = deathCount;
        showHUD();
        startLevel(currentLevel);
    });

    function startLevel(levelNum) {
        if (levelNum === 1) {
            resetLevel1State();
            showScreen(questionScreen);
            setTimeout(startLevel1Logic, 1500);
        } else if (levelNum === 2) {
            resetLevel2State();
            showScreen(l2q1Screen);
            // L2 Q1 has no timer, just wait for click
        } else if (levelNum === 3) {
            showScreen(l3Screen);
            setTimeout(startLevel3Logic, 1500);
        } else if (levelNum === 4) {
            document.body.classList.add('theme-l4');
            showScreen(document.getElementById('l4-intro-screen'));
            typeText(document.getElementById('l4-intro-text'), 'A BLONDE GIRL that tried to hit on chris...', 80, () => {
                document.getElementById('l4-continue-btn').classList.remove('hidden');
            });
        } else if (levelNum === 5) {
            document.getElementById('l5-intro-text').innerText = '';
            showScreen(document.getElementById('l5-intro-screen'));
            setTimeout(() => {
                typeText(document.getElementById('l5-intro-text'), 'now go find your final prize...', 100, () => {
                    setTimeout(() => {
                        const l5Screen = document.getElementById('level-5-screen');
                        const gameCanvas = document.getElementById('game-canvas');
                        showScreen(l5Screen);
                        setTimeout(() => {
                            gameCanvas.classList.remove('hidden');
                            gameCanvas.classList.add('active');
                            startLevel5Logic();
                        }, 1000);
                    }, 2000);
                });
            }, 2500);
        }
    }

    // --- EVASION LOGIC (Generic) ---
    function evadeCursor(e) {
        if (!evasionActiveScreen || !evasionActiveScreen.classList.contains('active')) return;
        if (isShooting || !evasionActiveBtn) return;

        evasionActiveBtn.style.pointerEvents = 'none';

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const btnRect = evasionActiveBtn.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;

        const vecX = btnCenterX - mouseX;
        const vecY = btnCenterY - mouseY;
        const distance = Math.sqrt(vecX * vecX + vecY * vecY);

        const evadeRadius = 180;

        if (distance < evadeRadius) {
            let nX = distance === 0 ? 1 : vecX / distance;
            let nY = distance === 0 ? 0 : vecY / distance;

            let newCenterX = mouseX + nX * evadeRadius;
            let newCenterY = mouseY + nY * evadeRadius;

            let newX = newCenterX - btnRect.width / 2;
            let newY = newCenterY - btnRect.height / 2;

            const padding = 20;
            let hitLeft = newX < padding;
            let hitRight = newX > window.innerWidth - btnRect.width - padding;
            let hitTop = newY < padding;
            let hitBottom = newY > window.innerHeight - btnRect.height - padding;
            
            if (hitLeft) newX = padding;
            if (hitRight) newX = window.innerWidth - btnRect.width - padding;
            if (hitTop) newY = padding;
            if (hitBottom) newY = window.innerHeight - btnRect.height - padding;

            if ((hitLeft || hitRight) && (hitTop || hitBottom)) {
                isShooting = true;
                if (hitLeft) newX = window.innerWidth - btnRect.width - padding - 150;
                else newX = padding + 150;
                
                if (hitTop) newY = window.innerHeight - btnRect.height - padding - 150;
                else newY = padding + 150;

                evasionActiveBtn.style.position = 'fixed';
                evasionActiveBtn.style.transition = 'left 0.2s ease-out, top 0.2s ease-out';
                evasionActiveBtn.style.left = `${newX}px`;
                evasionActiveBtn.style.top = `${newY}px`;
                evasionActiveBtn.style.transform = `scale(0.9)`;
                evasionActiveBtn.style.boxShadow = `0 0 30px rgba(255, 0, 127, 0.8)`;
                
                setTimeout(() => {
                    isShooting = false;
                }, 200);
            } else {
                evasionActiveBtn.style.position = 'fixed';
                evasionActiveBtn.style.transition = 'none';
                evasionActiveBtn.style.left = `${newX}px`;
                evasionActiveBtn.style.top = `${newY}px`;
                evasionActiveBtn.style.transform = `scale(0.9)`;
                evasionActiveBtn.style.boxShadow = `0 0 30px rgba(255, 0, 127, 0.8)`;
            }
        } else {
            if (!isShooting) {
                evasionActiveBtn.style.transform = `scale(1)`;
                evasionActiveBtn.style.boxShadow = `none`;
            }
        }
    }

    // --- LEVEL 1 LOGIC ---
    function resetLevel1State() {
        timeRemaining = TIMEOUT_SECONDS;
        timerProgress.style.width = '100%';
        noBtnScale = 1;
        noBtn.style.transform = `scale(1)`;
        noBtn.style.backgroundColor = `transparent`;
        noBtn.style.borderColor = `rgba(255, 255, 255, 0.2)`;
        noBtn.style.boxShadow = `none`;
        yesBtn.style.left = '20%';
        yesBtn.style.top = '50%';
        yesBtn.style.position = 'absolute';
        yesBtn.style.transform = `scale(1)`;
        yesBtn.style.pointerEvents = 'auto';
        isShooting = false;
    }

    function startLevel1Logic() {
        timerProgress.style.width = '100%';
        
        timerInterval = setInterval(() => {
            timeRemaining -= 0.1;
            const percentage = (timeRemaining / TIMEOUT_SECONDS) * 100;
            timerProgress.style.width = `${percentage}%`;
            
            if (timeRemaining <= 0) {
                winLevel(`
                    I see how hard you tried to click "Yes".<br><br>
                    It was an impossible task, by design.<br>
                    But your persistent determination to reach it...<br>
                    That shows your true feelings.<br><br>
                    <span class="highlight">He knows.</span>
                `);
            }
        }, 100);

        evasionActiveBtn = yesBtn;
        evasionActiveScreen = questionScreen;
        document.addEventListener('mousemove', evadeCursor);
    }

    noBtn.addEventListener('mouseenter', () => {
        if (noBtnScale < MAX_NO_BTN_SCALE) {
            noBtnScale += 0.3;
            noBtn.style.transform = `scale(${noBtnScale})`;
            noBtn.style.backgroundColor = `rgba(255, 0, 127, ${noBtnScale * 0.1})`;
            noBtn.style.borderColor = `rgba(255, 0, 127, ${0.5 + noBtnScale * 0.1})`;
            noBtn.style.boxShadow = `0 0 ${20 * noBtnScale}px rgba(255, 0, 127, 0.4)`;
        }
    });

    noBtn.addEventListener('click', () => {
         handleDeath(`You gave up so quickly...<br><br>But don't worry, even when you try to escape,<br>He's never going to let you go! 💕`);
    });
    
    yesBtn.addEventListener('click', () => {
        winLevel(`
            Wow. You actually caught it.<br><br>
            Your sheer willpower defies logic.<br>
            <span class="highlight">He definitely knows you love him.</span>
        `);
    });

    // --- LEVEL 2 LOGIC ---
    function resetLevel2State() {
        l2q2KittenBtn.style.left = '10%';
        l2q2KittenBtn.style.top = 'auto';
        l2q2KittenBtn.style.position = 'absolute';
        l2q2KittenBtn.style.transform = `scale(1)`;
        l2q2KittenBtn.style.pointerEvents = 'auto';
        isShooting = false;
        evasionActiveBtn = null;
        evasionActiveScreen = null;
        sisterBoxes.forEach(b => b.value = '');
        chrispyBoxes.forEach(b => b.value = '');
        eerieTypewriterText.innerHTML = '';
        sisterQText.innerHTML = '';
        chrispyQText.innerHTML = '';
        smarterQText.innerHTML = '';
    }

    l2q1WrongBtns.forEach(btn => {
        btn.addEventListener('click', () => {
             handleDeath(`You chose poorly...<br>He is very disappointed.<br><span class="highlight">He was watching.</span>`);
        });
    });

    l2q1RightBtn.addEventListener('click', () => {
         showScreen(l2q2Screen);
         setTimeout(startLevel2Q2Logic, 1500);
    });

    function startLevel2Q2Logic() {
         evasionActiveBtn = l2q2KittenBtn;
         evasionActiveScreen = l2q2Screen;
         document.addEventListener('mousemove', evadeCursor);
    }
    
    l2q2BoyfriendBtn.addEventListener('click', () => {
         document.removeEventListener('mousemove', evadeCursor);
         evasionActiveBtn = null;
         evasionActiveScreen = null;
         showScreen(l2FpsScreen);
         setTimeout(startLevel2FpsLogic, 1500);
    });
    
    l2q2KittenBtn.addEventListener('click', () => {
         handleDeath(`You chose the kitten over him...<br><br>Even though it was impossible to catch...<br><span class="highlight">That was a fatal mistake.</span>`);
    });

    // FPS Section (Now part of Level 2)
    function startLevel2FpsLogic() {
        document.addEventListener('mousemove', handleFPSAiming);
        document.addEventListener('mousedown', handleFPSClick);
    }

    function handleFPSAiming(e) {
        if (!l2FpsScreen.classList.contains('active')) return;

        crosshair.style.left = `${e.clientX}px`;
        crosshair.style.top = `${e.clientY}px`;

        const gunRect = gunContainer.getBoundingClientRect();
        const pivotX = gunRect.left + (gunRect.width * 0.8);
        const pivotY = gunRect.bottom;
        
        const dx = e.clientX - pivotX;
        const dy = e.clientY - pivotY;
        
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        gunContainer.style.transform = `rotate(${angle + 135}deg)`;
    }

    function handleFPSClick(e) {
        if (!l2FpsScreen.classList.contains('active')) return;
        
        muzzleFlash.classList.remove('hidden');
        muzzleFlash.classList.remove('flash-anim');
        void muzzleFlash.offsetWidth; // Reflow
        muzzleFlash.classList.add('flash-anim');

        crosshair.classList.add('shooting');
        document.body.classList.add('screen-shake');
        
        setTimeout(() => {
            crosshair.classList.remove('shooting');
            document.body.classList.remove('screen-shake');
        }, 200);

        if (e.target.closest('#target-ilayda')) {
            document.removeEventListener('mousemove', handleFPSAiming);
            document.removeEventListener('mousedown', handleFPSClick);
            
            showScreen(eerieTransitionScreen);
            setTimeout(() => {
                typeText(eerieTypewriterText, "now let's make it hard.", 100, () => {
                    setTimeout(() => {
                        showScreen(l2q3Screen);
                        setTimeout(() => {
                            typeText(sisterQText, "What's the name of the sister of Chris?", 60, () => {
                                sisterBoxes[0].focus();
                            });
                        }, 1500);
                    }, 2500);
                });
            }, 1500);
        } else if (e.target.closest('#target-chris')) {
            document.removeEventListener('mousemove', handleFPSAiming);
            document.removeEventListener('mousedown', handleFPSClick);
            handleDeath(`Why would you shoot your own boyfriend?<br><br><span class="highlight">He trusted you...</span>`);
        }
    }

    // Sister Name Logic
    setupTypingBoxes(sisterBoxes, "clarissa", 
        () => {
            showScreen(l2q4Screen);
            setTimeout(() => {
                typeText(chrispyQText, "whats the name of his down part", 60, () => {
                    chrispyBoxes[0].focus();
                });
            }, 1500);
        },
        () => {
            handleDeath(`You don't even know his sister's name?<br><br><span class="highlight">He is very disappointed.</span>`);
        }
    );

    // Chrispy Logic
    setupTypingBoxes(chrispyBoxes, "chrispy", 
        () => {
            showScreen(l2q5Screen);
            setTimeout(() => {
                typeText(smarterQText, "Who is smarter?", 60, () => {});
            }, 1500);
        },
        () => {
            handleDeath(`You forgot already?<br><br><span class="highlight">Unforgivable.</span>`);
        }
    );

    function setupTypingBoxes(boxes, correctWord, onWin, onLose) {
        boxes.forEach((box, index) => {
            box.addEventListener('input', (e) => {
                if (box.value.length === 1) {
                    if (index < boxes.length - 1) {
                        boxes[index + 1].focus();
                    } else {
                        // Last box filled
                        let answer = "";
                        boxes.forEach(b => answer += b.value);
                        if (answer.toLowerCase() === correctWord) {
                            onWin();
                        } else {
                            onLose();
                        }
                    }
                }
            });
            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && box.value === '') {
                    if (index > 0) boxes[index - 1].focus();
                }
            });
        });
    }

    // Who is smarter logic
    smarterDilara.addEventListener('click', () => {
        handleDeath(`Wrong answer.<br><br><span class="highlight">I am the correct answer.</span>`);
    });

    smarterChris.addEventListener('click', () => {
        winLevel(`
            You know everything about him.<br><br>
            <span class="highlight">He is yours forever.</span>
        `);
    });

    // --- LEVEL 3 PLATFORMER LOGIC ---
    let l3AnimationFrame = null;
    let keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };
    
    // Simple player state
    let player = {
        x: 50, y: 100, width: 40, height: 60,
        vx: 0, vy: 0,
        speed: 6, jumpPower: -14, gravity: 0.6,
        grounded: false, crawling: false,
        img: new Image()
    };
    player.img.src = 'dilara.PNG';

    let chrisImg = new Image();
    chrisImg.src = 'chris.PNG';
    
    let isRound2 = false;
    let l4Phase = 1; // 1 = Small Boss, 2 = Big Boss, 3 = Swarm
    let timerL4 = 20.00;
    
    // Images
    let bossImg = new Image();
    bossImg.src = 'blonde.webp';
    
    let bigBossImg = new Image();
    bigBossImg.src = 'blonde boss.webp';

    let dilaraImg = new Image();
    dilaraImg.src = 'dilara.PNG';

    let platforms = [];
    let deathZones = [];
    let winZone = null;
    let cameraX = 0;
    let currentPlatform = null;

    function startLevel3Logic() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Reset player
        player.x = 100;
        player.y = canvas.height - 150;
        player.vx = 0;
        player.vy = 0;
        player.grounded = false;
        player.crawling = false;
        keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };
        cameraX = 0;
        
        canvas.classList.remove('hidden');
        canvas.classList.add('active');

        // Brutal level layout
        let ch = canvas.height;
        platforms = [
            // Start zone
            { x: 0, y: ch - 50, w: 500, h: 50 },
            
            // First jump (easy)
            { x: 600, y: ch - 150, w: 100, h: 20 },
            
            // Higher jumps
            { x: 800, y: ch - 250, w: 50, h: 20 },
            { x: 1000, y: ch - 350, w: 50, h: 20 },
            
            // Drop down to long platform
            { x: 1200, y: ch - 100, w: 800, h: 50 },
            
            // Crawl trap: low ceiling
            { x: 1500, y: 0, w: 300, h: ch - 140 }, 

            // After crawl, the stairway up
            { x: 2000, y: ch - 150, w: 60, h: 20 },
            { x: 2200, y: ch - 250, w: 60, h: 20 },
            { x: 2400, y: ch - 350, w: 60, h: 20 }, // Top box
            
            // The Trap Jump!
            // Destination block is at 2800, looks big and safe (but it's actually unreachable!).
            { id: "trap-dest", x: 2800, y: ch - 150, w: 300, h: 50 },
            
            // Hidden block that will appear
            { id: "hidden-safe", x: 2600, y: ch - 100, w: 60, h: 20, hidden: true },

            // Moving Platforms
            { x: 3200, y: ch - 200, w: 80, h: 20, vx: 2, minX: 3200, maxX: 3500 },
            { x: 3700, y: ch - 300, w: 80, h: 20, vy: 2, minY: ch - 400, maxY: ch - 150 },
            { x: 4000, y: ch - 150, w: 80, h: 20, vx: 3, minX: 3900, maxX: 4500 },
            
            // Second crawl tunnel over abyss
            { x: 4800, y: ch - 200, w: 400, h: 20 }, // Floor
            { x: 4800, y: 0, w: 400, h: ch - 240 },  // Ceiling

            // Final stairway to Chris
            { x: 5300, y: ch - 150, w: 50, h: 20 },
            { x: 5450, y: ch - 250, w: 50, h: 20 },
            { x: 5600, y: ch - 350, w: 50, h: 20 },
            { x: 5750, y: ch - 450, w: 50, h: 20 },
            
            // Final stretch
            { x: 6000, y: ch - 200, w: 1000, h: 200 }
        ];

        deathZones = [
            // The entire floor is lava/abyss
            { x: -1000, y: ch - 10, w: 10000, h: 50 }
        ];

        // The Door
        winZone = { x: 6600, y: ch - 400, w: 100, h: 200 };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        gameLoop();
    }

    function handleKeyDown(e) {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    }
    
    function handleKeyUp(e) {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    }

    function gameLoop() {
        if (!l3Screen.classList.contains('active')) return;

        updatePhysics();
        drawGame();

        l3AnimationFrame = requestAnimationFrame(gameLoop);
    }

    function updatePhysics() {
        // Platform movements
        platforms.forEach(p => {
            if (p.vx) {
                p.x += p.vx;
                if (p.x > p.maxX || p.x < p.minX) p.vx *= -1;
            }
            if (p.vy) {
                p.y += p.vy;
                if (p.y > p.maxY || p.y < p.minY) p.vy *= -1;
            }
        });

        // Trap logic
        if (player.x > 2400 && player.x < 2650 && player.vy < 0) {
            let trapDest = platforms.find(p => p.id === "trap-dest");
            let hiddenSafe = platforms.find(p => p.id === "hidden-safe");
            if (trapDest && !trapDest.triggered) {
                trapDest.triggered = true;
                // Shrink and shift the block to the right to act as a bridge
                trapDest.x = 2900;
                trapDest.w = 80; 
                trapDest.h = 20;
                hiddenSafe.hidden = false; // reveal safe block
            }
        }

        // Add platform velocity to player if glued
        if (player.grounded && currentPlatform) {
            if (currentPlatform.vx) player.x += currentPlatform.vx;
            if (currentPlatform.vy && currentPlatform.vy > 0) player.y += currentPlatform.vy;
        }

        // Horizontal
        if (keys.ArrowLeft) player.vx = -player.speed;
        else if (keys.ArrowRight) player.vx = player.speed;
        else player.vx = 0;

        // Crawl
        if (keys.ArrowDown && player.grounded) {
            if (!player.crawling) {
                player.crawling = true;
                player.height = 30; // shrink hit box
                player.y += 30;     // shift down to stay flush with the floor
            }
            player.vx *= 0.5; // crawl slower
        } else {
            // Check if we can stand up (no ceiling above)
            let canStand = true;
            // Only check if we are currently crawling
            if (player.crawling) {
                platforms.forEach(p => {
                    // Check if there is a ceiling directly above the player's current position
                    if (player.x < p.x + p.w && player.x + player.width > p.x) {
                        // If we stood up, our new Y would be player.y - 30.
                        // Check if the range [player.y - 30, player.y] intersects the platform
                        if (player.y - 30 < p.y + p.h && player.y > p.y) {
                            canStand = false;
                        }
                    }
                });
            }
            
            if (canStand) {
                if (player.crawling) {
                    player.crawling = false;
                    player.height = 60;
                    player.y -= 30; // shift up so feet stay on the floor
                }
            } else {
                // Forced to stay crawling
                player.crawling = true;
                player.height = 30;
                player.vx *= 0.5;
            }
        }

        // Jump
        if (keys.ArrowUp && player.grounded && !player.crawling) {
            player.vy = player.jumpPower;
            player.grounded = false;
        }

        // Gravity
        player.vy += player.gravity;
        if (player.vy > 18) player.vy = 18; // Cap terminal velocity so she doesn't clip through floors

        player.x += player.vx;
        player.y += player.vy;

        // Left boundary
        if (player.x < 0) player.x = 0;

        // Collision logic
        player.grounded = false;
        currentPlatform = null;
        
        platforms.forEach(p => {
            if (p.hidden) return; // Skip collision for hidden blocks
            
            // AABB collision
            if (player.x < p.x + p.w && player.x + player.width > p.x &&
                player.y < p.y + p.h && player.y + player.height > p.y) {
                
                // Falling onto platform
                if (player.vy >= 0 && player.y + player.height - player.vy <= p.y + 20) {
                    player.grounded = true;
                    player.vy = 0;
                    player.y = p.y - player.height;
                    currentPlatform = p;
                } 
                // Hitting head on ceiling
                else if (player.vy < 0 && player.y - player.vy >= p.y + p.h - 10) {
                    player.vy = 0;
                    player.y = p.y + p.h;
                }
                // Wall collisions
                else {
                    if (player.vx > 0) { // moving right
                        player.x = p.x - player.width;
                    } else if (player.vx < 0) { // moving left
                        player.x = p.x + p.w;
                    }
                }
            }
        });

        // Death zones
        deathZones.forEach(d => {
            if (player.x < d.x + d.w && player.x + player.width > d.x &&
                player.y < d.y + d.h && player.y + player.height > d.y) {
                handleDeath(`You fell into the abyss...<br><br><span class="highlight">He expected more from you.</span>`);
            }
        });

        // Win zone
        if (player.x < winZone.x + winZone.w && player.x + player.width > winZone.x &&
            player.y < winZone.y + winZone.h && player.y + player.height > winZone.y) {
            
            // VICTORY!
            cancelAnimationFrame(l3AnimationFrame);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            
            // Hide the canvas properly
            canvas.classList.remove('active');
            canvas.classList.add('hidden');
            
            winLevel(`
                YOU WON HIS HEART.<br><br>
                <span class="highlight" style="font-size:0.6em; color:#00ffff;">...but that's not enough.</span>
            `);
        }

        // Update Camera Tracking
        cameraX = player.x - canvas.width / 3;
        if (cameraX < 0) cameraX = 0;
    }

    function drawGame() {
        // Clear background
        ctx.fillStyle = '#0f0008';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(-cameraX, 0);

        // Draw platforms
        ctx.fillStyle = '#ff007f';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff007f';
        platforms.forEach(p => {
            if (!p.hidden) {
                ctx.fillRect(p.x, p.y, p.w, p.h);
            }
        });

        // Draw death zones
        ctx.fillStyle = '#aa0000';
        ctx.shadowColor = '#ff0000';
        deathZones.forEach(d => {
            ctx.fillRect(d.x, d.y, d.w, d.h);
        });

        // Draw Door & Chris
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.fillRect(winZone.x, winZone.y, winZone.w, winZone.h);
        if (chrisImg.complete) {
            // Chris face peering out
            ctx.drawImage(chrisImg, winZone.x + 10, winZone.y + 50, 80, 100);
        }
        ctx.font = "20px Orbitron";
        ctx.fillText("EXIT", winZone.x, winZone.y - 10);

        // Draw Player
        ctx.shadowBlur = 0;
        if (player.img.complete) {
            ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        ctx.restore();
    }

    // --- LEVEL 4 BOSS FIGHT LOGIC ---
    let l4AnimationFrame = null;
    let l4Keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, KeyX: false };
    
    let p4 = {
        x: 0, y: 0, width: 50, height: 75,
        speed: 5, hp: 40, maxHp: 40,
        facingAngle: -Math.PI / 2, // Up
        punching: false, punchTimer: 0,
        vx: 0, vy: 0, stunTimer: 0,
        img: new Image(), gloveImg: new Image()
    };
    p4.img.src = 'dilara.PNG';
    p4.gloveImg.src = 'glov.png';

    let boss = {
        x: 0, y: 0, width: 80, height: 120,
        speed: 2, hp: 20, maxHp: 20,
        facingAngle: Math.PI / 2, // Down
        punching: false, punchTimer: 0, punchInterval: 180, punchAnimTimer: 0,
        img: new Image(), gloveImg: new Image(),
        dead: false, dissolve: 1.0, gloveDamage: 2
    };
    boss.img.src = 'blonde.webp';
    boss.gloveImg.src = 'glov.png';

    let furiousMode = false;
    
    // --- ROUND 2 STATE ---
    let r2TimeLeft = 20.00;
    let swarm = [];

    function startLevel4Logic() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        p4.x = canvas.width / 2 - p4.width / 2;
        p4.y = canvas.height - 150;
        p4.hp = 40;
        p4.punching = false;
        p4.vx = 0; p4.vy = 0; p4.stunTimer = 0;

        boss.x = canvas.width / 2 - boss.width / 2;
        boss.y = 100;
        boss.hp = 20;
        boss.maxHp = 20;
        boss.punchInterval = 180;
        boss.gloveDamage = 2;
        boss.dead = false;
        boss.dissolve = 1.0;
        furiousMode = false;
        
        isRound2 = false;
        swarm = [];
        document.getElementById('r2-ui').classList.add('hidden');
        document.getElementById('l4-ui').classList.remove('hidden');

        updateL4UI();

        document.addEventListener('keydown', l4KeyDown);
        document.addEventListener('keyup', l4KeyUp);

        l4GameLoop();
    }

    function l4KeyDown(e) {
        if (l4Keys.hasOwnProperty(e.code) || e.code === 'KeyX') {
            if (e.code === 'KeyX' && !p4.punching && !isRound2 && p4.stunTimer <= 0) {
                p4.punching = true;
                p4.punchTimer = 15; // 15 frames for punch animation
                checkPlayerHit();
            }
            if (e.code === 'KeyX') l4Keys.KeyX = true;
            else l4Keys[e.code] = true;
        }
    }

    function l4KeyUp(e) {
        if (l4Keys.hasOwnProperty(e.code) || e.code === 'KeyX') {
            if (e.code === 'KeyX') l4Keys.KeyX = false;
            else l4Keys[e.code] = false;
        }
    }

    function checkPlayerHit() {
        // Calculate glove reach point
        let cx = p4.x + p4.width / 2;
        let cy = p4.y + p4.height / 2;
        let hitX = cx + Math.cos(p4.facingAngle) * 80;
        let hitY = cy + Math.sin(p4.facingAngle) * 80;

        let bcx = boss.x + boss.width / 2;
        let bcy = boss.y + boss.height / 2;

        let distToHitPoint = Math.hypot(hitX - bcx, hitY - bcy);
        let distCenter = Math.hypot(cx - bcx, cy - bcy);

        // Huge sweeping hitbox: 80px around glove OR 60px around body
        if (distToHitPoint < 80 || distCenter < 60) {
            boss.hp -= 1;
            updateL4UI();
            
            // Enrage check
            if (boss.hp === 10) {
                furiousMode = true;
                boss.punchInterval = 120; // 2 seconds
                boss.speed = 3.5;
            }
            // Check Phase 1/2 Win
            if (boss.hp <= 0 && !boss.dead) {
                boss.hp = 0;
                boss.dead = true;
                boss.dissolve = 1.0;
            }
        }
    }

    function checkBossHit() {
        if (boss.dead || isRound2) return;
        
        // Only hit if boss is actively punching
        if (!boss.punching) return;

        let cx = boss.x + boss.width / 2;
        let cy = boss.y + boss.height / 2;
        let hitX = cx + Math.cos(boss.facingAngle) * (boss.width / 2 + 40);
        let hitY = cy + Math.sin(boss.facingAngle) * (boss.height / 2 + 40);

        let pcx = p4.x + p4.width / 2;
        let pcy = p4.y + p4.height / 2;

        let distToHitPoint = Math.hypot(hitX - pcx, hitY - pcy);
        let distCenter = Math.hypot(cx - pcx, cy - pcy);

        // Hit if close to glove OR close to body
        if ((distToHitPoint < 80 || distCenter < 60) && p4.stunTimer <= 0) {
            p4.hp -= boss.gloveDamage;
            
            // Knockback
            let angle = Math.atan2(pcy - cy, pcx - cx);
            
            if (l4Phase === 2) {
                // Extreme Knockback for Phase 2 Boss
                p4.vx = Math.cos(angle) * 30;
                p4.vy = Math.sin(angle) * 30;
            } else {
                // Normal Knockback
                p4.vx = Math.cos(angle) * 15;
                p4.vy = Math.sin(angle) * 15;
            }
            
            p4.stunTimer = 15; // I-frames
            
            updateL4UI();
            if (p4.hp <= 0) {
                handleL4Death();
            }
        }
    }

    function applyKnockbackToPlayer(angle, damage) {
        p4.hp -= damage;
        p4.stunTimer = 25; // Disable controls for ~0.4s
        // Velocity of 40 with 0.9 friction ~400px pushback
        p4.vx = Math.cos(angle) * 45;
        p4.vy = Math.sin(angle) * 45;
        
        updateL4UI();
        if (p4.hp <= 0) {
            handleL4Death();
        }
    }

    function updateL4UI() {
        let p4Fill = document.getElementById('dilara-hp');
        let bossFill = document.getElementById('boss-hp');
        let p4Text = document.getElementById('dilara-hp-text');
        let bossText = document.getElementById('boss-hp-text');
        
        let p4Pct = Math.max(0, (p4.hp / p4.maxHp * 100));
        let bossPct = Math.max(0, (boss.hp / boss.maxHp * 100));
        
        if (p4Fill) p4Fill.style.width = p4Pct + '%';
        if (bossFill) bossFill.style.width = bossPct + '%';
        if (p4Text) p4Text.innerText = Math.round(p4Pct) + '%';
        if (bossText) bossText.innerText = Math.round(bossPct) + '%';
    }

    function winLevel4() {
        cleanupAllLevelListeners();
        
        canvas.style.transition = 'opacity 1s';
        canvas.style.opacity = 0;
        setTimeout(() => {
            canvas.classList.remove('active');
            canvas.classList.add('hidden');
            canvas.style.opacity = 1;
        }, 1000);
        
        winLevel("You survived the onslaught...<br><br><span class=\"highlight\">But she left a parting gift in the dark.</span>");
    }

    function handleL4Death() {
        cleanupAllLevelListeners();
        
        canvas.classList.remove('active');
        canvas.classList.add('hidden');
        
        handleDeath(`She got to him first...<br><br><span class="highlight" style="color:#00ffff">You weren't quick enough.</span>`);
    }

    function l4GameLoop() {
        if (document.getElementById('level-4-screen').classList.contains('hidden')) {
            // Loop stops if the screen is fully hidden
            return;
        }

        updateL4Physics();
        drawL4();

        l4AnimationFrame = requestAnimationFrame(l4GameLoop);
    }

    function updateL4Physics() {
        if (boss.dead && !isRound2) {
            boss.dissolve -= 0.01;
            
            // Wait for dissolve to finish, then show the transition text once
            if (boss.dissolve <= 0 && !l4PhaseTransition) {
                l4PhaseTransition = true;
                
                document.getElementById('r2-ui').classList.remove('hidden');
                let h1 = document.querySelector('#r2-ui h1');
                let timerEl = document.getElementById('r2-timer');
                
                if (l4Phase === 1) {
                    h1.innerText = "STILL NOT ENOUGH";
                    h1.setAttribute('data-text', "STILL NOT ENOUGH");
                    timerEl.style.display = 'none';
                    
                    setTimeout(() => {
                        l4PhaseTransition = false;
                        startPhase2();
                    }, 3000);
                } else if (l4Phase === 2) {
                    h1.innerText = "ROUND 2: SURVIVE";
                    h1.setAttribute('data-text', "ROUND 2: SURVIVE");
                    timerEl.style.display = 'block';
                    
                    setTimeout(() => {
                        l4PhaseTransition = false;
                        startRound2();
                    }, 3000);
                }
            }
            return;
        }

        // Player Movement Logic (only if not stunned)
        let dx = 0; let dy = 0;
        if (p4.stunTimer <= 0) {
            if (l4Keys.ArrowLeft) dx -= 1;
            if (l4Keys.ArrowRight) dx += 1;
            if (l4Keys.ArrowUp) dy -= 1;
            if (l4Keys.ArrowDown) dy += 1;
        } else {
            p4.stunTimer--;
        }

        let prevX = p4.x;
        let prevY = p4.y;

        if (dx !== 0 || dy !== 0) {
            p4.facingAngle = Math.atan2(dy, dx);
            let length = Math.hypot(dx, dy);
            p4.x += (dx / length) * p4.speed;
            p4.y += (dy / length) * p4.speed;
        }
        
        // Apply Knockback Velocity
        p4.x += p4.vx;
        p4.y += p4.vy;
        p4.vx *= 0.85; // Friction
        p4.vy *= 0.85;

        // Sliding Circular Collision
        if (!boss.dead && !isRound2) {
            let pcx = p4.x + p4.width / 2;
            let pcy = p4.y + p4.height / 2;
            let bcx = boss.x + boss.width / 2;
            let bcy = boss.y + boss.height / 2;
            
            let dist = Math.hypot(pcx - bcx, pcy - bcy);
            let minDist = 50; // The closest they can get
            
            if (dist < minDist && dist > 0.1) {
                let overlap = minDist - dist;
                let angle = Math.atan2(pcy - bcy, pcx - bcx);
                // Softly push the player away along the circle, allowing them to slide
                p4.x += Math.cos(angle) * overlap;
                p4.y += Math.sin(angle) * overlap;
            }
        }

        // Clamp player
        if (p4.x < 0) p4.x = 0;
        if (p4.x + p4.width > canvas.width) p4.x = canvas.width - p4.width;
        if (p4.y < 0) p4.y = 0;
        if (p4.y + p4.height > canvas.height) p4.y = canvas.height - p4.height;

        // Player Punch Timer
        if (p4.punching) {
            p4.punchTimer--;
            if (p4.punchTimer <= 0) p4.punching = false;
        }

        // Round 2 Logic
        if (isRound2) {
            r2TimeLeft -= 1 / 60; // Assuming 60fps
            document.getElementById('r2-timer').innerText = r2TimeLeft.toFixed(2);
            
            if (r2TimeLeft <= 0) {
                isRound2 = false; // Prevent multiple triggers
                winLevel4();
                return;
            }
            
            let pcx = p4.x + p4.width / 2;
            let pcy = p4.y + p4.height / 2;

            for (let i = 0; i < swarm.length; i++) {
                let m = swarm[i];
                let mx = m.x + m.w / 2;
                let my = m.y + m.h / 2;
                
                // Track player fast
                let angle = Math.atan2(pcy - my, pcx - mx);
                m.x += Math.cos(angle) * m.speed;
                m.y += Math.sin(angle) * m.speed;
                
                // Jitter
                m.x += (Math.random() - 0.5) * 5;
                m.y += (Math.random() - 0.5) * 5;

                // Collision
                if (p4.stunTimer <= 0) {
                    if (Math.hypot(mx - pcx, my - pcy) < 30) {
                        applyKnockbackToPlayer(angle, 1);
                    }
                }
            }
            
            return; // Skip boss logic
        }

        // Boss AI (Phase 1 & 2)
        if (!boss.dead && !isRound2 && !l4PhaseTransition) {
            let cx = boss.x + boss.width / 2;
            let cy = boss.y + boss.height / 2;
            let px = p4.x + p4.width / 2;
            let py = p4.y + p4.height / 2;
            
            boss.facingAngle = Math.atan2(py - cy, px - cx);
            
            boss.x += Math.cos(boss.facingAngle) * boss.speed;
            boss.y += Math.sin(boss.facingAngle) * boss.speed;
            
            boss.punchTimer++;
            if (boss.punchTimer >= boss.punchInterval) {
                boss.punchTimer = 0;
                boss.punching = true;
                boss.punchAnimTimer = 20;
            }
            
            if (boss.punching) {
                boss.punchAnimTimer--;
                checkBossHit(); // Attempt to hit while punching
                if (boss.punchAnimTimer <= 0) boss.punching = false;
            }
            
            // Prevent boss from fully overlapping player
            let dist = Math.hypot(px - cx, py - cy);
            if (dist < 40) {
                boss.x -= Math.cos(boss.facingAngle) * boss.speed;
                boss.y -= Math.sin(boss.facingAngle) * boss.speed;
            }
        }

        // Clamp boss
        if (boss.x < 0) boss.x = 0;
        if (boss.x + boss.width > canvas.width) boss.x = canvas.width - boss.width;
        if (boss.y < 0) boss.y = 0;
        if (boss.y + boss.height > canvas.height) boss.y = canvas.height - boss.height;
    }

    function startPhase2() {
        l4Phase = 2;
        boss.img = bigBossImg;
        boss.width = 160;
        boss.height = 160;
        boss.x = canvas.width / 2 - 80;
        boss.y = 50;
        boss.hp = 15;
        boss.maxHp = 15;
        boss.speed = 2.5;
        boss.punchInterval = 168; // 2.8 seconds
        boss.gloveDamage = 3; // 3 hp damage extreme
        boss.dead = false;
        boss.dissolve = 0;
        
        furiousMode = false;
        updateL4UI();
        
        document.getElementById('r2-ui').classList.add('hidden');
    }

    function startRound2() {
        l4Phase = 3;
        isRound2 = true;
        
        document.getElementById('r2-ui').classList.add('hidden');
        r2TimeLeft = 20.00;
        p4.hp = 30;
        updateL4UI();
        
        document.getElementById('l4-ui').classList.hidden = true;
        document.getElementById('r2-ui').classList.remove('hidden');

        // Spawn swarm
        swarm = [];
        for (let i = 0; i < 20; i++) {
            swarm.push({
                x: Math.random() < 0.5 ? -100 : canvas.width + 100,
                y: Math.random() * canvas.height,
                w: 40, h: 60,
                speed: Math.random() * 3 + 2
            });
        }
    }

    function drawL4() {
        // Furious ambient red flashes
        if (furiousMode && !isRound2) {
            let intensity = Math.abs(Math.sin(Date.now() / 200)) * 50;
            ctx.fillStyle = `rgb(${intensity}, 10, 26)`;
        } else {
            ctx.fillStyle = '#000a1a';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Boss (Phase 1 & 2)
        ctx.save();
        if (boss.dead) {
            ctx.globalAlpha = Math.max(0, boss.dissolve);
        }
        
        if (!isRound2) {
            ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);
            
            let bossGloveDist = boss.punching ? Math.max(80, boss.width/2 + 20) : boss.width/2;
            
            // Draw boss punch arc
            if (boss.punching) {
                ctx.fillStyle = 'rgba(255, 0, 85, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, bossGloveDist, boss.facingAngle - 0.4, boss.facingAngle + 0.4);
                ctx.lineTo(0, 0);
                ctx.fill();
            }

            // Boss Gloves
            if (boss.gloveImg && boss.gloveImg.complete) {
                let blAngle = boss.facingAngle - 0.5;
                let brAngle = boss.facingAngle + 0.5;
                
                // Draw 2 gloves for Phase 2, or maybe Phase 1 also has 2 gloves
                ctx.save();
                ctx.translate(Math.cos(blAngle) * bossGloveDist, Math.sin(blAngle) * bossGloveDist);
                ctx.rotate(boss.facingAngle + Math.PI/2);
                ctx.drawImage(boss.gloveImg, -15, -15, 30, 30);
                ctx.restore();
                
                ctx.save();
                ctx.translate(Math.cos(brAngle) * bossGloveDist, Math.sin(brAngle) * bossGloveDist);
                ctx.rotate(boss.facingAngle + Math.PI/2);
                ctx.drawImage(boss.gloveImg, -15, -15, 30, 30);
                ctx.restore();
            }

            if (boss.img && boss.img.complete) {
                ctx.drawImage(boss.img, -boss.width / 2, -boss.height / 2, boss.width, boss.height);
            }
        }
        ctx.restore();

        // Draw Swarm
        if (isRound2 && boss.img.complete) {
            swarm.forEach(m => {
                ctx.drawImage(boss.img, m.x, m.y, m.w, m.h);
            });
        }

        // Draw Player
        ctx.save();
        ctx.translate(p4.x + p4.width / 2, p4.y + p4.height / 2);
        
        // Draw player punch arc
        if (p4.punching) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, 60, p4.facingAngle - 0.4, p4.facingAngle + 0.4);
            ctx.lineTo(0, 0);
            ctx.fill();
        }

        if (p4.img.complete) {
            ctx.drawImage(p4.img, -p4.width / 2, -p4.height / 2, p4.width, p4.height);
        }

        // Draw player flash if stunned
        if (p4.stunTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-p4.width / 2, -p4.height / 2, p4.width, p4.height);
            ctx.globalAlpha = 1.0;
        }

        // Draw Gloves (only in Phase 1)
        if (!isRound2) {
            let gloveDist = p4.punching ? 60 : 30; // Move 30px out when punching
            let lAngle = p4.facingAngle - 0.5;
            let rAngle = p4.facingAngle + 0.5;

            if (p4.gloveImg.complete) {
                // Left Glove
                ctx.save();
                ctx.translate(Math.cos(lAngle) * gloveDist, Math.sin(lAngle) * gloveDist);
                ctx.rotate(p4.facingAngle + Math.PI/2);
                ctx.drawImage(p4.gloveImg, -15, -15, 30, 30);
                ctx.restore();

                // Right Glove
                ctx.save();
                ctx.translate(Math.cos(rAngle) * gloveDist, Math.sin(rAngle) * gloveDist);
                ctx.rotate(p4.facingAngle + Math.PI/2);
                ctx.drawImage(p4.gloveImg, -15, -15, 30, 30);
                ctx.restore();
            }
        }

        ctx.restore();
    }

    // --- LEVEL 5 FLASHLIGHT MAZE LOGIC ---
    let l5AnimationFrame = null;
    let chest = {
        x: 0, y: 0, width: 80, height: 80,
        img: new Image()
    };
    chest.img.src = 'chest.webp';

    function startLevel5Logic() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        p4.x = canvas.width / 2;
        p4.y = canvas.height - 150;
        
        // Randomize chest position in top half of screen
        chest.x = Math.random() * (canvas.width - 200) + 100;
        chest.y = Math.random() * ((canvas.height / 2) - 150) + 50;

        document.addEventListener('keydown', l5KeyDown);
        document.addEventListener('keyup', l5KeyUp);

        l5GameLoop();
    }

    function l5KeyDown(e) {
        if (l4Keys.hasOwnProperty(e.code) || e.code === 'KeyX') {
            if (e.code === 'KeyX') checkChestInteract();
            l4Keys[e.code] = true;
        }
    }

    function l5KeyUp(e) {
        if (l4Keys.hasOwnProperty(e.code) || e.code === 'KeyX') {
            l4Keys[e.code] = false;
        }
    }

    function checkChestInteract() {
        let pcx = p4.x + p4.width / 2;
        let pcy = p4.y + p4.height / 2;
        let ccx = chest.x + chest.width / 2;
        let ccy = chest.y + chest.height / 2;
        
        if (Math.hypot(pcx - ccx, pcy - ccy) < 100) {
            // Found chest! Trigger Finale!
            cleanupAllLevelListeners();
            
            canvas.classList.remove('active');
            canvas.classList.add('hidden');
            document.getElementById('level-5-screen').classList.remove('active');
            document.getElementById('level-5-screen').classList.add('hidden');
            
            triggerFinale();
        }
    }

    function l5GameLoop() {
        if (document.getElementById('level-5-screen').classList.contains('hidden')) return;

        // Player Movement (Reusing Level 4 keys)
        let dx = 0; let dy = 0;
        if (l4Keys.ArrowLeft) dx -= 1;
        if (l4Keys.ArrowRight) dx += 1;
        if (l4Keys.ArrowUp) dy -= 1;
        if (l4Keys.ArrowDown) dy += 1;

        if (dx !== 0 || dy !== 0) {
            let length = Math.hypot(dx, dy);
            p4.x += (dx / length) * p4.speed;
            p4.y += (dy / length) * p4.speed;
        }

        // Clamp
        if (p4.x < 0) p4.x = 0;
        if (p4.x + p4.width > canvas.width) p4.x = canvas.width - p4.width;
        if (p4.y < 0) p4.y = 0;
        if (p4.y + p4.height > canvas.height) p4.y = canvas.height - p4.height;

        drawL5();

        l5AnimationFrame = requestAnimationFrame(l5GameLoop);
    }

    function drawL5() {
        // Draw underlying background
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Chest
        if (chest.img.complete) {
            ctx.drawImage(chest.img, chest.x, chest.y, chest.width, chest.height);
        } else {
            ctx.fillStyle = 'gold';
            ctx.fillRect(chest.x, chest.y, chest.width, chest.height);
        }

        // Draw Player (No gloves needed in maze)
        ctx.save();
        ctx.translate(p4.x + p4.width / 2, p4.y + p4.height / 2);
        if (p4.img.complete) {
            ctx.drawImage(p4.img, -p4.width / 2, -p4.height / 2, p4.width, p4.height);
        }
        ctx.restore();

        // Draw Darkness Overlay
        ctx.save();
        
        let pcx = p4.x + p4.width / 2;
        let pcy = p4.y + p4.height / 2;
        
        // Create a radial gradient from player center
        let gradient = ctx.createRadialGradient(pcx, pcy, 50, pcx, pcy, 180); 
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.restore();
    }

    // --- GRAND FINALE ANIMATION LOGIC ---
    function triggerFinale() {
        let flash = document.getElementById('white-flash');
        flash.classList.remove('hidden');
        flash.style.transition = 'none';
        flash.style.opacity = '1';
        
        showScreen(document.getElementById('payment-finale-screen'));
        
        // Timeline orchestration
        setTimeout(() => {
            flash.style.transition = 'opacity 2s ease-out';
            flash.style.opacity = '0';
        }, 100);

        setTimeout(() => {
            flash.classList.add('hidden');
        }, 2100);

        setTimeout(() => {
            document.getElementById('finale-chris').classList.remove('hidden');
        }, 2500);

        setTimeout(() => {
            document.getElementById('wallet-container').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('wallet-container').classList.add('wallet-open');
            }, 500);
        }, 3000);

        setTimeout(() => {
            document.querySelector('.credit-card').classList.add('card-slide-out');
        }, 4500);

        setTimeout(() => {
            document.getElementById('card-reader').classList.remove('hidden');
        }, 5500);

        setTimeout(() => {
            document.querySelector('.reader-screen').classList.add('approved');
            document.querySelector('.reader-screen').innerText = 'APPROVED';
        }, 8000);

        // Phase 3.5: Camera & Hearts
        setTimeout(() => {
            document.getElementById('wallet-container').classList.add('hidden');
            document.getElementById('card-reader').classList.add('hidden');
            document.getElementById('finale-chris').classList.add('hidden');

            const cameraScene = document.getElementById('camera-scene');
            cameraScene.classList.remove('hidden');
            
            const cameraIcon = document.getElementById('camera-icon');
            setTimeout(() => {
                cameraIcon.style.opacity = '1';
                cameraIcon.style.transform = 'scale(1.5)';
            }, 100);

            // Flash & Hearts
            setTimeout(() => {
                let flash = document.getElementById('white-flash');
                flash.classList.remove('hidden');
                flash.style.transition = 'none';
                flash.style.opacity = '1';
                
                setTimeout(() => {
                    flash.style.transition = 'opacity 1s ease-out';
                    flash.style.opacity = '0';
                    setTimeout(() => flash.classList.add('hidden'), 1000);
                }, 100);

                // Create Hearts
                const heartsContainer = document.getElementById('hearts-container');
                for(let i=0; i<60; i++) {
                    let heart = document.createElement('div');
                    heart.innerHTML = '💖';
                    heart.className = 'love-heart';
                    let angle = Math.random() * Math.PI * 2;
                    let dist = Math.random() * 400 + 100;
                    let tx = Math.cos(angle) * dist + 'px';
                    let ty = Math.sin(angle) * dist + 'px';
                    let scale = Math.random() * 1.5 + 0.5;
                    heart.style.setProperty('--tx', tx);
                    heart.style.setProperty('--ty', ty);
                    heart.style.setProperty('--s', scale);
                    heartsContainer.appendChild(heart);
                }

                // Show Text Note
                document.getElementById('camera-note').style.opacity = '1';

            }, 1500);

        }, 9000);

        // Phase 4: Final Present Reveal
        setTimeout(() => {
            const finalModal = document.getElementById('final-present-modal');
            finalModal.classList.remove('hidden');
            setTimeout(() => finalModal.classList.add('show'), 100);
        }, 16000);
    }

    const finalClaimBtn = document.getElementById('final-claim-btn');
    if (finalClaimBtn) {
        finalClaimBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Claim button clicked!');
            document.querySelectorAll('.screen').forEach(s => {
                s.classList.remove('active');
                s.classList.add('hidden');
                s.style.display = 'none';
            });
            const ultimateScreen = document.getElementById('ultimate-win-screen');
            ultimateScreen.classList.remove('hidden');
            ultimateScreen.classList.add('active');
            ultimateScreen.style.display = 'flex';
        });
    }

});
