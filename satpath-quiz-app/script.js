let currentQuestionIndex = 0;
let answeredCount = 0;
let score = 0;
let skippedCount = 0;
let questions = [];

// Fetch questions from the JSON file
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        document.getElementById('total-questions').textContent = questions.length;
        showQuestion();
    })
    .catch(error => console.error('Error loading questions:', error));

function showQuestion() {
    const questionContainer = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const nextButton = document.getElementById('next-button');
    const skipButton = document.getElementById('skip-button');
    const buttonContainer = document.getElementById('button-container');
    const resultContainer = document.getElementById('result');

    // Clear previous options
    optionsContainer.innerHTML = '';
    resultContainer.style.display = 'none';
    nextButton.style.display = 'none'; // Hide next button initially
    buttonContainer.style.display = 'none'; // Hide button container initially

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
        buttonContainer.style.display = 'grid';
    } else {
        showResult();
    }
}

let selectedOption = null; // Store the selected option

function selectOption(button, selectedOptionText) {
    const currentQuestion = questions[currentQuestionIndex];

    // Remove 'selected' class from all option buttons
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(btn => btn.classList.remove('selected'));

    // Highlight the selected option
    button.classList.add('selected');
    selectedOption = selectedOptionText; // Store the selected option

    // Check if an option was selected
    if (selectedOption) {
        if (selectedOption === currentQuestion.answer) {
            score++;
            // Highlight the correct answer
            const correctButton = Array.from(document.querySelectorAll('.option-button')).find(btn => btn.textContent === currentQuestion.answer);
            if (correctButton) {
                correctButton.classList.add('correct');
            }
        } else {
            // Highlight the incorrect answer
            const incorrectButton = Array.from(document.querySelectorAll('.option-button')).find(btn => btn.textContent === selectedOption);
            if (incorrectButton) {
                incorrectButton.classList.add('incorrect');
            }
            // Highlight the correct answer
            const correctButton = Array.from(document.querySelectorAll('.option-button')).find(btn => btn.textContent === currentQuestion.answer);
            if (correctButton) {
                correctButton.classList.add('correct');
            }
        }

        // Show the next button after selecting an option
        document.getElementById('next-button').style.display = 'block';
    }
}

function nextQuestion() {
    answeredCount++;
    document.getElementById('answered-questions').textContent = answeredCount;
    currentQuestionIndex++;
    selectedOption = null; // Reset selected option
    showQuestion();
}

function skipQuestion() {
    skippedCount++;
    document.getElementById('skipped-questions').textContent = skippedCount; // Update skipped count
    currentQuestionIndex++;
    showQuestion();
}

document.getElementById('next-button').onclick = nextQuestion;
document.getElementById('skip-button').onclick = skipQuestion;

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
