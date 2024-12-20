let prevQuestionIndex = 0;
let currentQuestionIndex = 0;
let answeredCount = 0;
let score = 0;
let skippedCount = 0;
let questions = [];
let answersMap = {};

// Fetch questions from the JSON file
let p1 = fetch('questions.json')
    .then(response => response.json())
    .catch(error => console.error('Error loading questions:', error));

let p2 = fetch('answers.json')
    .then(response => response.json())
    .catch(error => console.error('Error loading answers:', error));

Promise.all([p1, p2])
    .then(([data1, data2]) => {
        questions = data1.slice(0,900);
        document.getElementById('total-questions').textContent = questions.length;

        answersMap = data2;
        questions.forEach((_, index) => {
            let q = questions[index];
            q.answer = answersMap[index];
        });

        createNavigationBar(); // Create navigation bar after loading questions
        showQuestion();

    })

function showQuestion() {
    const questionContainer = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const nextButton = document.getElementById('next-button');
    const skipButton = document.getElementById('skip-button');
    const resultContainer = document.getElementById('result');

    // Clear previous options
    optionsContainer.innerHTML = '';
    resultContainer.style.display = 'none';
    nextButton.style.display = 'none'; // Hide next button initially
    skipButton.style.display = 'none'; // Hide skip button initially

    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        questionContainer.textContent = currentQuestion.question;

        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-button'; // Add class for styling
            button.onclick = () => selectOption(button, option);
            optionsContainer.appendChild(button);
        });

        // Show the button container
        if (currentQuestionIndex < questions.length) {
            skipButton.style.display = 'block'; // Show skip button
        }

    } else {
        showResult();
    }
    highlightButton(currentQuestionIndex);
    // store();

    // updateNavigationBar(); // Update the navigation bar after showing the question
}

let selectedOption = null; // Store the selected option

function selectOption(button, selectedOptionText) {
    const currentQuestion = questions[currentQuestionIndex];

    // Remove 'selected' class from all option buttons
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(btn => {
        btn.classList.remove('selected')
        btn.classList.remove('correct')
        btn.classList.remove('incorrect')
    });

    // Highlight the selected option
    button.classList.add('selected');
    selectedOption = selectedOptionText; // Store the selected option

    // Check if an option was selected
    if (selectedOption) {
        if(currentQuestion.answer) {
            if (selectedOption === currentQuestion.answer) {
                score++;
                button.classList.add('correct');
            } else {
                button.classList.add('incorrect');
            }
        }

        // Show the next button after selecting an option
        document.getElementById('next-button').style.display = 'block';
    }

    store({id: currentQuestionIndex, answer: selectedOptionText});
}

function nextQuestion() {
    answeredCount++;
    document.getElementById('answered-questions').textContent = answeredCount;
    prevQuestionIndex = currentQuestionIndex;
    currentQuestionIndex++;
    selectedOption = null; // Reset selected option
    showQuestion();
}

function skipQuestion() {
    skippedCount++;
    document.getElementById('skipped-questions').textContent = skippedCount; // Update skipped count
    prevQuestionIndex = currentQuestionIndex;
    currentQuestionIndex++;
    showQuestion();
}

function highlightButton(currentQuestionIndex) {

    const newSelectedBtn = document.getElementById(`nav-btn-${currentQuestionIndex + 1}`);
    newSelectedBtn.classList.add('selected');

    newSelectedBtn.scrollIntoView({
        inline: "center" 
    });

    const oldSelectedBtn = document.getElementById(`nav-btn-${prevQuestionIndex + 1}`);
    oldSelectedBtn.classList.remove('selected');
}

document.getElementById('next-button').onclick = nextQuestion;
document.getElementById('skip-button').onclick = skipQuestion;

// Navigation button event listeners
document.getElementById('first-button').onclick = () => {
    prevQuestionIndex = currentQuestionIndex;
    currentQuestionIndex = 0;
    showQuestion();
};

document.getElementById('prev-button').onclick = () => {
    if (currentQuestionIndex > 0) {
        prevQuestionIndex = currentQuestionIndex;
        currentQuestionIndex--;
        showQuestion();
    }
};

document.getElementById('next-button-nav').onclick = () => {
    if (currentQuestionIndex < questions.length - 1) {
        prevQuestionIndex = currentQuestionIndex;
        currentQuestionIndex++;
        showQuestion();
    }
};

document.getElementById('last-button').onclick = () => {
    prevQuestionIndex = currentQuestionIndex;
    currentQuestionIndex = questions.length - 1;
    showQuestion();
};

function showResult() {
    const questionContainer = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const nextButton = document.getElementById('next-button');
    const skipButton = document.getElementById('skip-button');
    const buttonContainer = document.getElementById('button-container');
    const resultContainer = document.getElementById('result');

    questionContainer.style.display = 'none';
    optionsContainer.style.display = 'none';
    nextButton.style.display = 'none';
    skipButton.style.display = 'none';
    buttonContainer.style.display = 'none'; // Hide button container

    resultContainer.textContent = `You scored ${score} out of ${questions.length}.`;
    resultContainer.style.display = 'block';
}

function createNavigationBar() {
    const questionButtonsContainer = document.getElementById('question-buttons');
    questionButtonsContainer.innerHTML = ''; // Clear previous navigation buttons

    // Create navigation buttons for each question
    questions.forEach((_, index) => {
        const button = document.createElement('button');
        button.textContent = index + 1; // Display question number
        button.className = 'nav-button'; // Add class for styling
        button.id = `nav-btn-${index + 1}`;
        button.onclick = () => navigateToQuestion(index);
        questionButtonsContainer.appendChild(button);
    });
}

function navigateToQuestion(index) {
    prevQuestionIndex = currentQuestionIndex;
    currentQuestionIndex = index;
    selectedOption = null; // Reset selected option
    showQuestion();
}

function updateNavigationBar() {
    const questionButtonsContainer = document.getElementById('question-buttons');
    const buttons = questionButtonsContainer.querySelectorAll('.nav-button');

    // Hide all buttons initially
    // buttons.forEach(button => button.style.display = 'none');

    // Show only the buttons that fit within the 200px width
    let totalWidth = 0;
    const maxWidth = 200; // Maximum width for the navigation bar
    const buttonWidth = 40; // Approximate width of each button

    for (let i = 0; i < buttons.length; i++) {
        if (totalWidth + buttonWidth <= maxWidth) {
            // buttons[i].style.display = 'inline-block'; // Show button
            totalWidth += buttonWidth;
        } else {
            break; // Stop if the width exceeds the limit
        }
    }
}

function store(questionResponse) {

    let answers = readStore();

    answers[questionResponse.id] = questionResponse.answer;
    console.log(answers);
    localStorage.setItem('answers', JSON.stringify(answers));
}

const downloadData = () => {

    const date = new Date();
    const postFixStr = date.toLocaleDateString().replaceAll('/', "_") + "__" + date.toLocaleTimeString().replaceAll(':', "_");
    
    let storeData = readStore();
    const file1 = new Blob([JSON.stringify(storeData, null, 2)], { type: 'application/json' });
    // const file1 = new Blob([dataStr], { type: 'text/plain;charset=utf-8' });
    const fileName1 = "answers-" + postFixStr + ".json";
    saveAs(file1, fileName1);
};

function readStore() {
    let dataStr = localStorage.getItem('answers');
    let answers;
    if(!dataStr) {
        answers = {}
    } else {
        answers = JSON.parse(dataStr);
    }

    return answers;
}

// readStore();