const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { pastas } = require("./pastas");
const pasta = substituirBarra(process.env.FOLDER_LOCATION);

function substituirBarra(str) {
	return str.replace(/\\+/g, "/");
}

function lerArquivosDaPasta(caminho) {
	return new Promise((resolve, reject) => {
		fs.readdir(caminho, (err, arquivos) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(arquivos);
		});
	});
}

const criarPasta = async (nomePasta) => {
	fs.mkdir(`${pasta}\\${nomePasta}`, { recursive: true }, (err) => {
		if (err) throw err;
	});
};

const moverArquivo = async (nomeArquivo, novaPasta) => {
	fs.rename(
		`${pasta}\\${nomeArquivo}`,
		`${pasta}\\${novaPasta}\\${nomeArquivo}`,
		(err) => {
			if (err) throw err;
		},
	);
};

const organizaArquivo = async (nomeArquivo, novaPasta) => {
	if (!fs.existsSync(`${pasta}\\${novaPasta}`)) {
		await criarPasta(novaPasta);
		await moverArquivo(nomeArquivo, novaPasta);
	} else {
		await moverArquivo(nomeArquivo, novaPasta);
	}
};

const organizaArquivos = async () => {
	try {
		let arquivos = await lerArquivosDaPasta(pasta);
		let promises = [];

		const allExtensions = Object.values(pastas).flat();
		const duplicateExtensions = allExtensions.filter(
			(ext, index) => allExtensions.indexOf(ext) !== index,
		);
		if (duplicateExtensions.length > 0) {
			console.log("Remova extensões duplicadas:", duplicateExtensions);
			return;
		}

		await arquivos.forEach(async (e) => {
			const extensao = path.extname(e).toLowerCase();
			let keys = Object.keys(pastas);
			keys.forEach(async (f) => {
				if (pastas[f].includes(extensao)) {
					promises.push(organizaArquivo(e, f));
					console.log(`${e} -> ${f}`);
				}
			});
		});
		await Promise.all(promises);
		console.log("Arquivos organizados com sucesso");
	} catch (error) {
		console.log("Erro ao organizar arquivos");
	}
};

organizaArquivos();
