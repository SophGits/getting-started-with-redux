import deepFreeze from 'deep-freeze';
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

// This code is the same as the completed video (#18):
// https://egghead.io/lessons/javascript-redux-react-todo-list-example-toggling-a-todo

const todo = (state, action) => { // here the 'state' refers to an indidivual todo, not the list
  switch (action.type) {
    case 'ADD_TODO' :
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO' :
      if(state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO' :
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO' :
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const visibilityFilter = (
  state = 'SHOW_ALL',
  action
) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER' :
      return action.filter;
    default :
      return state;
  }
}

const { combineReducers } = Redux;
const todoApp = combineReducers({ // this is the root reducer
  todos,
  visibilityFilter
  // Since 'todos: todos' (field name : reducer name) You can use the ES6  object literal short-hand notation and just omit the keys
});

const { createStore } = Redux;
const store = createStore(todoApp);

const { Component } = React;

let nextTodoId = 0;

class TodoApp extends Component {
  render() {
    return (
      <div>
      <input ref={node => {
        this.input = node;
      }} />
        <button onClick={() => {
            store.dispatch({
              type: 'ADD_TODO',
              text: this.input.value,
              id: nextTodoId++
            });
            this.input.value = '';
          }}>
          Add Todo
        </button>
        <ul>
        {this.props.todos.map(todo =>
          <li key={todo.id}
            onClick={() => {
              store.dispatch({
                type: 'TOGGLE_TODO',
                id: todo.id
              }); // when an action is dispatched the store calls the root reducer, which calls the todos reducer
            }}
            style={{
              textDecoration:
                todo.completed ?
                  'line-through' :
                  'none'
            }}
          >
            {todo.text}
          </li>
        )}
        </ul>
      </div>
    )
  };
}

const render = () => {
  ReactDOM.render(
    <TodoApp todos={store.getState().todos} />,
    document.getElementById('root')
  )
};

store.subscribe(render); // any time the store's state changes, render is called
render();

// const testAddTodo = () => {
//   const stateBefore = [];
//   const action = {
//     type: 'ADD_TODO',
//     id: 0,
//     text: 'Learn Redux'
//   };
//   const stateAfter = [
//     {
//       id: 0,
//       text: 'Learn Redux',
//       completed: false
//     }
//   ];

//   deepFreeze(stateBefore);
//   deepFreeze(action);

//   expect(
//     todos(stateBefore, action)
//   ).toEqual(stateAfter);
// };

// const testToggleTodo = () => {
//   const stateBefore = [
//     {
//       id: 0,
//       text: 'Learn Redux',
//       completed: false
//     },
//     {
//       id: 1,
//       text: 'Go shopping',
//       completed: false
//     }
//   ];
//   const action = {
//     type: 'TOGGLE_TODO',
//     id: 1
//   };
//   const stateAfter = [
//     {
//       id: 0,
//       text: 'Learn Redux',
//       completed: false
//     },
//     {
//       id: 1,
//       text: 'Go shopping',
//       completed: true
//     }
//   ];

//   deepFreeze(stateBefore);
//   deepFreeze(action);

//   expect(
//     todos(stateBefore, action)
//   ).toEqual(stateAfter);
// }

// testAddTodo();
// testToggleTodo();
// console.log('All tests have passed');

// console.log('Current state:');
// console.log(store.getState());

// console.log('Dispatching SET_VISIBILITY_FILTER');
// store.dispatch({
//   type: 'SET_VISIBILITY_FILTER',
//   filter: 'SHOW_COMPLETED'
// });

// console.log('Current state:');
// console.log(store.getState());