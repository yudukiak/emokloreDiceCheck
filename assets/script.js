window.onload = _ => {
    let reader = new FileReader()
    document.getElementById('htmlFile').addEventListener('change', event => {
        const files = event.target.files
        if (!files.length) return
        const file = files[0]
        const fileName = file.name
        if (!/\.html?$/.test(fileName)) return alert('HTMLファイルを選択してください')
        if (/^\d+$/.test(chart.id)) chart.destroy()
        reader.readAsText(file, 'UTF-8')
        reader.onload = () => {
            const parser = new DOMParser()
            const newDocument = parser.parseFromString(reader.result, "text/html")
            const resultObj = getResultObj(newDocument)
            createListTab(resultObj)
            createChart(resultObj['全体']['result'])
        }
    })
}

const getResultObj = newDocument => {
    const resultElms = newDocument.getElementsByTagName('p')
    let resultObj = { '全体': { 'result': [0, 0, 0, 0, 0, 0, 0] } }
    for (let i = 0; i < resultElms.length; i++) {
        const element = resultElms[i]
        const tab = element.children[0].textContent.trim()
        let name = element.children[1].textContent.trim()
        const cmd = element.children[2].textContent.trim()
        if (name === '') name = '（空欄）'
        if (!/メイン/.test(tab)) continue // メインタブ以外は処理しない
        if (!/DM<=/.test(cmd)) continue // エモクロアのコマンド以外は処理しない
        if (resultObj[name] == null) resultObj[name] = JSON.parse(JSON.stringify(RESULT))
        resultObj[name]['log'].push(cmd)
        if (/ファンブル!$/.test(cmd)) resultObj[name]['result'][0] += 1, resultObj['全体']['result'][0] += 1
        if (/失敗!$/.test(cmd)) resultObj[name]['result'][1] += 1, resultObj['全体']['result'][1] += 1
        if (/成功!$/.test(cmd)) resultObj[name]['result'][2] += 1, resultObj['全体']['result'][2] += 1
        if (/ダブル!$/.test(cmd)) resultObj[name]['result'][3] += 1, resultObj['全体']['result'][3] += 1
        if (/トリプル!$/.test(cmd)) resultObj[name]['result'][4] += 1, resultObj['全体']['result'][4] += 1
        if (/ミラクル!$/.test(cmd)) resultObj[name]['result'][5] += 1, resultObj['全体']['result'][5] += 1
        if (/カタストロフ!$/.test(cmd)) resultObj[name]['result'][6] += 1, resultObj['全体']['result'][6] += 1
    }
    return resultObj
}

const createListTab = obj => {
    document.getElementById('list').innerHTML = ''
    let html = ''
    for (const name in obj) {
        if (!/全体/.test(name)) {
            html += `<li class="nav-item" id="tab-${name}"><span class="nav-link">${name}</span></li>`
            createList(name, obj[name])
        }
    }
    document.getElementById('tab').innerHTML = html
}

const createChart = ary => {
    const ctx = document.getElementById('chart').getContext('2d')
    const opt = JSON.parse(JSON.stringify(OPTION))
    for (let i = 0; i < ary.length; i++) opt.data.labels[i] = `${opt.data.labels[i]}（${ary[i]}回）`
    opt.data.datasets[0].data = ary
    window.chart = new Chart(ctx, opt)
}

const createList = (name, obj) => {
    console.log(name, obj)
    let html = `<h3>${name}</h3>`
    for (let i = 0; i < obj['log'].length; i++) 
        html += `<li class="list-group-item">${obj['log'][i]}</li>`
    const elm = document.createElement('div')
    elm.innerHTML = html
    elm.classList.add('mb-3')
    elm.setAttribute('id', `list-${name}`)
    document.getElementById('list').appendChild(elm)
}

const RESULT = {
    'result': [0, 0, 0, 0, 0, 0, 0],
    'log': []
}

const OPTION = {
    type: 'bar',
    data: {
        labels: [
            '成功数 マイナス / ファンブル',
            '成功数 0 / 失敗',
            '成功数 1 / シングル',
            '成功数 2 / ダブル',
            '成功数 3 / トリプル',
            '成功数 4～9 / ミラクル',
            '成功数 10～ / カタストロフ'
        ],
        datasets: [{
            label: '出た回数',
            data: [1, 2, 3, 4, 5, 6, 7],
            barThickness: 20,
            backgroundColor: [
                'rgba(255, 97, 97, 0.2)',
                'rgba(255, 97, 97, 0.2)',
                'rgba(111, 137, 233, 0.2)',
                'rgba(89, 197, 255, 0.2)',
                'rgba(147, 201, 143, 0.2)',
                'rgba(209, 217, 127, 0.2)',
                'rgba(232, 112, 125, 0.2)'
            ],
            borderColor: [
                'rgba(255, 97, 97, 1)',
                'rgba(255, 97, 97, 1)',
                'rgba(111, 137, 233, 1)',
                'rgba(89, 197, 255, 1)',
                'rgba(147, 201, 143, 1)',
                'rgba(209, 217, 127, 1)',
                'rgba(232, 112, 125, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            }
        },
        maintainAspectRatio: false,
        responsive: true
    }
}