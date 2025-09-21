let RESULT_OBJECT = {}

window.onload = _ => {
    let reader = new FileReader()
    document.getElementById('htmlFile').addEventListener('change', event => {
        const files = event.target.files
        if (!files.length) return
        const file = files[0]
        const fileName = file.name
        if (!/\.html?$/.test(fileName)) return alert('HTMLファイルを選択してください')
        reader.readAsText(file, 'UTF-8')
        reader.onload = () => {
            const parser = new DOMParser()
            const newDocument = parser.parseFromString(reader.result, "text/html")
            const resultObj = getResultObj(newDocument)
            RESULT_OBJECT = resultObj
            createListTab()
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
        if (!/メイン|main/.test(tab)) continue // メインタブ以外は処理しない
        if (!/DM<=/.test(cmd)) continue // エモクロアのコマンド以外は処理しない
        if (resultObj[name] == null) resultObj[name] = JSON.parse(JSON.stringify(RESULT))
        resultObj[name]['log'].push(cmd)
        if (/ファンブル!?$/.test(cmd)) resultObj[name]['result'][0] += 1, resultObj['全体']['result'][0] += 1
        if (/失敗!?$/.test(cmd)) resultObj[name]['result'][1] += 1, resultObj['全体']['result'][1] += 1
        if (/成功!?$/.test(cmd)) resultObj[name]['result'][2] += 1, resultObj['全体']['result'][2] += 1
        if (/ダブル!?$/.test(cmd)) resultObj[name]['result'][3] += 1, resultObj['全体']['result'][3] += 1
        if (/トリプル!?$/.test(cmd)) resultObj[name]['result'][4] += 1, resultObj['全体']['result'][4] += 1
        if (/ミラクル!?$/.test(cmd)) resultObj[name]['result'][5] += 1, resultObj['全体']['result'][5] += 1
        if (/カタストロフ!?$/.test(cmd)) resultObj[name]['result'][6] += 1, resultObj['全体']['result'][6] += 1
    }
    return resultObj
}

const createListTab = _ => {
    document.getElementById('list').innerHTML = ''
    let tabHtml = '<li class="nav-item" id="tab-全体"> <span class="nav-link active">全体</span> </li>'
    let switchHtml = '<div class="col-6 col-lg-3 col-xxl-2"> <div class="form-check form-switch"> <input class="form-check-input" type="checkbox" id="switch-全体" checked disabled> <label class="form-check-label" for="switch-全体">全体</label> </div> </div>'
    for (const name in RESULT_OBJECT) {
        if (!/全体/.test(name)) {
            tabHtml += `<li class="nav-item" id="tab-${name}"><span class="nav-link">${name}</span></li>`
            switchHtml += `<div class="col-6 col-lg-3 col-xxl-2"> <div class="form-check form-switch"> <input class="form-check-input" type="checkbox" id="switch-${name}" checked> <label class="form-check-label" for="switch-${name}">${name}</label> </div> </div>`
            createList(name, RESULT_OBJECT[name])
        }
    }
    document.getElementById('tab').innerHTML = tabHtml
    document.querySelectorAll('.nav-item').forEach(t => {
        t.removeEventListener('click', tabChange, false)
        t.addEventListener('click', tabChange, false)
    })
    document.getElementById('switch').innerHTML = switchHtml
    document.querySelectorAll('.form-switch input').forEach(t => {
        t.removeEventListener('change', switchChange, false)
        t.addEventListener('change', switchChange, false)
    })
}

const tabChange = e => {
    const name = e.target.textContent
    createChart(RESULT_OBJECT[name]['result'])
    // タブのアクティブを切り替え
    document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'))
    document.getElementById(`tab-${name}`).firstElementChild.classList.add('active')
    listChange(name)
}

const switchChange = e => {
    const name = e.target.getAttribute('id').replace(/^switch-/, '')
    document.getElementById(`tab-${name}`).classList.toggle('d-none')
    const activeName = document.querySelector('.nav-link.active').textContent
    const result = RESULT_OBJECT['全体']['result']
    if (document.getElementById(`tab-${name}`).classList.contains('d-none')) {
        for (let i = 0; i < 7; i++) result[i] = result[i] - RESULT_OBJECT[name]['result'][i]
        // アクティブなタブがOFFになったら全体に切り替える
        if (activeName === name) {
            document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'))
            document.querySelector('#tab-全体 .nav-link').classList.add('active')
            createChart(result)
        } else {
            createChart(RESULT_OBJECT[activeName]['result'])
        }
    } else {
        for (let i = 0; i < 7; i++) result[i] = result[i] + RESULT_OBJECT[name]['result'][i]
        createChart(RESULT_OBJECT[activeName]['result'])
    }
    listChange(activeName)
}

const listChange = activeName => {
    document.querySelectorAll('[id^=list-]').forEach(t => t.classList.add('d-none'))
    document.querySelectorAll('[id^=switch-]:checked').forEach(t => {
        const name = t.getAttribute('id').replace(/^switch-/, '')
        if (/全体/.test(name)) return
        if (/全体/.test(activeName)) document.getElementById(`list-${name}`).classList.remove('d-none')
    })
    if (!/全体/.test(activeName)) document.getElementById(`list-${activeName}`).classList.remove('d-none')
}

const createChart = ary => {
    if (/^\d+$/.test(chart.id)) chart.destroy()
    const ctx = document.getElementById('chart').getContext('2d')
    const opt = JSON.parse(JSON.stringify(OPTION))
    for (let i = 0; i < ary.length; i++) opt.data.labels[i] = `${opt.data.labels[i]}（${ary[i]}回）`
    opt.data.datasets[0].data = ary
    window.chart = new Chart(ctx, opt)
}

const createList = (name, obj) => {
    //console.log(name, obj)
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