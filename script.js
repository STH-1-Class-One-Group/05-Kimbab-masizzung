/**
 * 메인 어플리케이션 로직
 * SPA 네비게이션 및 탭 기능 처리
 */
const app = {
    // 모든 섹션 숨기고 타겟 섹션만 표시
    showSection: (sectionId) => {
        document.querySelectorAll('section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        window.scrollTo(0, 0); // 화면 상단으로 이동
    },

    // 메인으로 이동
    goHome: () => {
        app.showSection('home-section');
    },

    // 탭 전환 (김밥 vs 후토마키)
    switchTab: (tabId) => {
        // 탭 버튼 스타일 초기화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 탭 컨텐츠 숨김
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 선택된 탭 활성화 (이벤트 타겟이 비동기로 들어올 수 있으므로 ID 매칭 사용)
        // 탭 버튼의 onclick에서 호출하므로, DOM 탐색으로 active 추가
        const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => 
            btn.getAttribute('onclick').includes(tabId)
        );
        if(targetBtn) targetBtn.classList.add('active');

        // 선택된 컨텐츠 표시
        document.getElementById(tabId).classList.add('active');
    }
};

/**
 * 김밥 취향 월드컵 게임 로직
 */
const worldCup = {
    // 32강 데이터
    initialList: [
        "야채김밥", "참치마요김밥", "치즈김밥", "소고기김밥", 
        "돈가스김밥", "제육김밥", "불고기김밥", "스팸김밥", 
        "닭갈비김밥", "훈제오리김밥", "진미채김밥", "멸치김밥", 
        "게맛살김밥", "어묵김밥", "새우튀김김밥", "날치알김밥", 
        "계란말이김밥", "묵은지김밥", "샐러드김밥", "우엉김밥", 
        "키토김밥", "고추장아찌김밥", "시금치김밥", "땡초김밥", 
        "와사비김밥", "카레김밥", "베이컨김밥", "훈제연어김밥", 
        "충무김밥", "꼬마김밥", "삼각김밥", "누드김밥"
    ],

    // 게임 상태
    round: [],         // 현재 라운드 대진 리스트 (랜덤 섞임)
    nextRoundList: [], // 다음 라운드 진출자 리스트
    currentMatchIdx: 0,// 현재 매치 인덱스
    
    // 게임 초기화 및 시작
    initGame: () => {
        // 복사 후 셔플
        worldCup.round = [...worldCup.initialList]; 
        worldCup.shuffle(worldCup.round);
        worldCup.nextRoundList = [];
        worldCup.currentMatchIdx = 0;

        // UI 초기화
        document.getElementById('game-start').classList.remove('active');
        document.getElementById('game-result').classList.remove('active');
        document.getElementById('game-playing').classList.add('active');

        worldCup.updateRoundUI();
        worldCup.renderMatch();
    },

    // 배열 섞기 (Fisher-Yates Shuffle)
    shuffle: (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    // 화면에 현재 대진 표시
    renderMatch: () => {
        const leftPlayer = worldCup.round[worldCup.currentMatchIdx * 2];
        const rightPlayer = worldCup.round[worldCup.currentMatchIdx * 2 + 1];

        // 대진 텍스트 업데이트
        const leftBtn = document.querySelector('#btn-left .food-name');
        const rightBtn = document.querySelector('#btn-right .food-name');

        // 페이드 효과를 위해 살짝 투명도 조절 (선택사항, 간단하게 텍스트 교체만 수행)
        leftBtn.innerText = leftPlayer;
        rightBtn.innerText = rightPlayer;

        // 라운드 진행상황 업데이트
        worldCup.updateRoundUI();
    },

    // 라운드 정보 텍스트 업데이트
    updateRoundUI: () => {
        const totalMatches = worldCup.round.length / 2;
        const currentMatch = worldCup.currentMatchIdx + 1;
        
        const roundLabel = document.getElementById('round-label');
        const matchCount = document.getElementById('match-count');

        // 2명 남았으면 "결승"
        if (worldCup.round.length === 2) {
            roundLabel.innerText = "결승전";
            matchCount.innerText = "";
        } else {
            roundLabel.innerText = `${worldCup.round.length}강`;
            matchCount.innerText = `${currentMatch} / ${totalMatches}`;
        }
    },

    // 승자 선택 시 실행
    selectWinner: (side) => { 
        // side: 0 (Left), 1 (Right)
        // 현재 매치의 승자를 결정하여 nextRoundList에 추가
        const winnerIndex = worldCup.currentMatchIdx * 2 + side;
        const winnerName = worldCup.round[winnerIndex];
        
        worldCup.nextRoundList.push(winnerName);
        
        // 다음 매치로 이동
        worldCup.currentMatchIdx++;

        // 현재 라운드의 모든 매치가 끝났는지 확인
        if (worldCup.currentMatchIdx >= worldCup.round.length / 2) {
            worldCup.finishRound();
        } else {
            worldCup.renderMatch();
        }
    },

    // 라운드 종료 처리
    finishRound: () => {
        // 만약 방금 끝난게 결승전(1명 진출)이라면 우승
        if (worldCup.nextRoundList.length === 1) {
            worldCup.showResult(worldCup.nextRoundList[0]);
            return;
        }

        // 다음 라운드 준비
        worldCup.round = [...worldCup.nextRoundList];
        worldCup.nextRoundList = [];
        worldCup.currentMatchIdx = 0;
        
        // 대진표 다시 섞기 (랜덤성 부여)
        worldCup.shuffle(worldCup.round);

        // 다음 라운드 시작
        worldCup.renderMatch();
    },

    // 최종 결과 화면
    showResult: (winnerName) => {
        document.getElementById('game-playing').classList.remove('active');
        document.getElementById('game-result').classList.add('active');
        document.getElementById('winner-name').innerText = winnerName;
        
        // 폭죽 효과 등은 생략하고 텍스트로 강조
    }
};
