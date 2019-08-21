const { ipcRenderer, remote } = require('electron'),
						 path = require('path'),
					Mousetrap = require('mousetrap'),
						   fs = require('fs'),
						  xur = require('../modules/xur.js'),
						    DOM = require('../modules/DOM.js')(document).shorthand;

DOM(function () {
	let browserWindow = remote.getCurrentWindow();

	var {
		content,
		min,
		restore,
		close,
		reloadButton,
		moreButton,
		settingsButton,
		creditsButton,
		backButton,
		devToolsButton,
		reloadAppButton,
		xurButton,
		quitButton
	} = DOM();

	let override = fs.readFileSync(path.join(__dirname, '../css/override.css'), 'utf8')

	if (getSettings().braytechBeta.value == true) {
		content.src = 'https://beta.braytech.org';
	} else {
		content.src = 'https://braytech.org';
	}

	content.addEventListener('dom-ready', function () {
		content.insertCSS(override);
	});

	content.addEventListener('new-window', event => {
		openInBrowser(event.url);
	});

	Mousetrap.bind(['shift+ctrl+r', 'command+alt+r'], reloadContent);
	Mousetrap.bind(['ctrl+,', 'cmd+,'], openSettings);
	Mousetrap.bind(['ctrl+r', 'cmd+r'], reloadApp);

	document.documentElement.setAttribute(
		'data-theme',
		getSettings().clientTheme.value
	);

	min.addEventListener('click', event => {
		browserWindow = remote.getCurrentWindow();
		browserWindow.minimize();
	});

	max.addEventListener('click', event => {
		browserWindow = remote.getCurrentWindow();
		browserWindow.maximize();
		toggleMaxRestores();
	});

	restore.addEventListener('click', event => {
		browserWindow = remote.getCurrentWindow();
		browserWindow.unmaximize();
		toggleMaxRestores();
	});

	toggleMaxRestores();
	browserWindow.on('maximize', toggleMaxRestores);
	browserWindow.on('unmaximize', toggleMaxRestores);

	close.addEventListener('click', event => {
		browserWindow = remote.getCurrentWindow();
		browserWindow.close();
	});

	reloadButton.addEventListener('click', reloadContent);

	settingsButton.addEventListener('click', event => {
		openSettings();
	});

	backButton.addEventListener('click', back);

	creditsButton.addEventListener('click', event => {
		navigate(path.join(__dirname, '../credits.html'));
		backstack = ['https://braytech.org'];
	});

	devToolsButton.addEventListener('click', toggleDevTools);

	reloadAppButton.addEventListener('click', reloadApp);

	xurButton.addEventListener('click', event => {
		navigate('https://www.oldmatexur.com');
		backstack = ['https://braytech.org'];
	});

	moreButton.addEventListener('mouseenter', event => {
		if (getSettings().devmode.value == true) {
			devToolsButton.style.display = 'block';
			reloadAppButton.style.display = 'block';
		} else {
			devToolsButton.style.display = 'none';
			reloadAppButton.style.display = 'none';
		}
	});

	if (xur.isAround) {
		xurButton.style.display = 'block';
	}

	function toggleMaxRestores() {
		browserWindow = remote.getCurrentWindow();
		if (browserWindow.isMaximized()) {
			max.style.display = 'none';
			restore.style.display = 'block';
		} else {
			restore.style.display = 'none';
			max.style.display = 'block';
		}
	}

	var backstack = [];
	back.enabled = false;

	function navigate(file) {
		let currentContent = content.src;
		backstack.push(currentContent);
		if (backstack.length === 1) {
			backButton.enable();
		}
		content.src = file;
	}

	backButton.enable = function () {
		backButton.classList.remove('back-disabled');
		backButton.enabled = true;
	};

	backButton.disable = function () {
		backButton.classList.add('back-disabled');
		backButton.enabled = false;
	};

	function back() {
		if (backButton.enabled) {
			let target = backstack.pop();
			content.src = target;
			if (backstack.length === 0) {
				backButton.disable();
			}
		}
	}

	function reloadContent() {
		content.src = content.src;
	}

	function openSettings() {
		ipcRenderer.send('showSettings');
	}

	function reloadApp() {
		browserWindow = remote.getCurrentWindow();
		browserWindow.reload();
	}

	function toggleDevTools() {
		browserWindow = remote.getCurrentWindow();
		browserWindow.toggleDevTools();
	}
});

function openInBrowser(url) {
	remote.shell.openExternal(url);
}

function getSettings() {
	return JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/settings.json'), 'utf8'));
}

ipcRenderer.on('reload-css', (event) => {
	document.documentElement.setAttribute(
		'data-theme',
		getSettings().clientTheme.value
	);
	for (var link of document.querySelectorAll("link[rel=stylesheet]")) link.href = link.href.replace(/\?.*|$/, "?ts=" + new Date().getTime())
})