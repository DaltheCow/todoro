import React, {Component} from 'react'
import {render} from 'react-dom'

function formatTime(time) {
  const seconds = time % 60
  const minutes = Math.floor(time / 60)
  const padZeros = seconds =>
    (seconds < 10 ? '0' : '') + seconds
  return `${minutes}:${padZeros(seconds)}`
}

let count = {
  padding: '3px 10px'
}

class App extends Component {
  render() {
    return (
      <div className="text-center">
        <Timer />
        <Todos />
      </div>
    )
  }
}
class Todos extends Component {
  constructor() {
    super()
    let todos
    try {
      todos = JSON.parse(localStorage.getItem('todos'))
      if (todos === null) {
        todos = []
      }
    } catch (err) {
      todos = []
    }
    this.state = {todos}
  }
  render() {
    localStorage.setItem('todos', JSON.stringify(this.state.todos))
    return (
      <div className="row">
        <div className="col-sm-offset-4 col-sm-4">
          <form onSubmit={e => {
            e.preventDefault()
            if (this.refs.input.value)
            this.setState({todos: this.state.todos.concat(this.refs.input.value)})
            this.refs.input.value = "";
          }} >
            <input className="form-control" ref="input" />
          </form>
          <div className="list-group">
            {this.state.todos.map((value, i) =>
              <div key={i} className="list-group-item">
              {value}
              <i className="pull-right glyphicon glyphicon-remove"
                onClick={() => {
                  const todos = this.state.todos
                  this.setState({
                    todos: [...todos.slice(0, i), ...todos.slice(i + 1)]
                  })
                }}></i>
              </div>)}
          </div>
        </div>
      </div>
    )
  }
}

class Timer extends Component {
  constructor() {
    super()
    this.titleEl = document.querySelector('title')

    let dailySession = localStorage.getItem('sessions'),
        dailySessionCount,
        date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
        session = new Date(year,month,day).getTime() - 1000 * 60 * 60 * 6

    if (dailySession !== null) {
      dailySession = JSON.parse(dailySession)
    }

    if (dailySession === null || Date.now() - dailySession.day > 1000 * 60 * 60 * 24) {
      localStorage.setItem('sessions', JSON.stringify({count: 0, day: session}))
      dailySessionCount = 0
    } else {
      dailySessionCount = dailySession.count
    }

    this.state = {time: 25 * 60,
                  running: false,
                  working: true,
                  startTime: Date.now(),
                  now: 25 * 60,
                  sessionCount: 0,
                  dailySessionCount}

    setInterval(() => {

      if (this.state.running) {

        this.setState({now: this.state.time - Math.floor((Date.now() - this.state.startTime) / 1000)})

        if (this.state.now <= 0) {

          document.querySelector("#alarm").play()
          if (this.state.working) {

            this.setState({dailySessionCount: this.dailySessions()})
            this.setState({sessionCount: this.state.sessionCount + 1})

          }
          this.toggleWorking()

        }
      }
    }, 100)
  }

  dailySessions() {

    const dailySession = JSON.parse(localStorage.getItem('sessions'))
    let session = dailySession.day
    let count = dailySession.count + 1

    if (Date.now() - session > 1000 * 60 * 60 * 24) {

      let date = new Date(),
          year = date.getFullYear(),
          month = date.getMonth(),
          day = date.getDate()

      session = new Date(year,month,day).getTime() - 1000 * 60 * 60 * 6
      count = 1
    }

    localStorage.setItem('sessions', JSON.stringify({count, day:session}))
    return count
  }

  toggleWorking() {
    const working = !this.state.working
    this.setState({
      time: working ? 25 * 60 : 5 * 60,
      working: working,
      startTime: Date.now(),
      now: working ? 25 * 60 : 5 * 60
    })
  }

  render() {
    this.titleEl.textContent = formatTime(this.state.now)
    return (
      <div>
        <h2>{formatTime(this.state.now)}</h2>
        <div className="btn-group">
          <button className="btn btn-default"
            onClick={() =>
              this.setState({
                time: this.state.working ? 25 * 60 : 5 * 60,
                now: this.state.working ? 25 * 60 : 5 * 60,
                startTime: Date.now()
              })
            }>
            <i className={'glyphicon glyphicon-step-backward'}></i>
          </button>
          <button
            className="btn btn-default"
            onClick={() => {
              if (!this.state.running) {
                this.setState({startTime: Date.now(), time: this.state.now})
              }
              this.setState({running: !this.state.running})
            }
            }>
            <i className={'glyphicon glyphicon-' +
            (this.state.running ? 'pause' : 'play')}></i>
          </button>
          <button className='btn btn-default'
            onClick={() => this.toggleWorking()}>
            <i className={'glyphicon glyphicon-step-forward'}></i>
          </button>
        </div>

        <div className='row'>
          <div className='col-sm-offset-5 col-sm-2'>
            <div className='list-group' style={{margin: 5, fontSize: 9}}>
              {this.state.sessionCount !== this.state.dailySessionCount ?
                <div style={count} className='list-group-item'>
                active pomos: {this.state.sessionCount}
                </div>
                : null}
              <div style={count} className='list-group-item'>
                daily pomos: {this.state.dailySessionCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

render(<App />, document.querySelector('#root'))