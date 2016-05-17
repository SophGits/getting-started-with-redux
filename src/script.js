import deepFreeze from 'deep-freeze';
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

// This code is the same as the completed video (lesson 21):
// https://egghead.io/lessons/javascript-redux-extracting-presentational-components-addtodo-footer-filterlink

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

const FilterLink = ({
  filter,
  currentFilter,
  children,
  onClick
}) => {
  if(filter === currentFilter) {
    return <span>{children}</span>;
  }

  return (
    <a href='#'
      onClick={e => {
        e.preventDefault();
        onClick(filter)
      }}
    >
      {children}
    </a>
  )
}

const Footer = ({
  visibilityFilter,
  onFilterClick
}) => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'
      currentFilter = {visibilityFilter}
      onClick ={onFilterClick}
    >
      All
    </FilterLink>

    {' '}
    <FilterLink
      filter='SHOW_ACTIVE'
      currentFilter = {visibilityFilter}
      onClick ={onFilterClick}
    >
      Active
    </FilterLink>

    {' '}
    <FilterLink
      filter='SHOW_COMPLETED'
      currentFilter = {visibilityFilter}
      onClick ={onFilterClick}
    >
      Completed
    </FilterLink>
  </p>
)

// presentational component. Does not specify behaviour - only renders a todo
const Todo = ({
  onClick,
  completed,
  text
}) => (
  <li
    onClick={onClick}
    style={{
      textDecoration:
        completed ?
          'line-through' :
          'none'
    }}
  >
    {text}  {/* see props above */}
  </li>
)

const TodoList = ({ // presentational component
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo =>
      <Todo key={todo.id}
      {...todo}
      onClick={() => onTodoClick(todo.id)}
      />
    )}
  </ul>
)

const getVisibleTodos = (
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL' :
      return todos;
    case 'SHOW_COMPLETED' :
      return todos.filter(
        t => t.completed
      );
    case 'SHOW_ACTIVE' :
      return todos.filter(
        t => !t.completed
      );
  }
}

const AddTodo = ({
  onAddClick
}) => {
  let input;

  return (
    <div>
      <input ref={node => {
        input = node;
      }} />
      <button onClick={() => {
          onAddClick(input.value);
          input.value = '';
        }}>
        Add Todo
      </button>
    </div>
  )
}

let nextTodoId = 0;
const TodoApp = ({
  todos,
  visibilityFilter
}) =>
(
  <div>
    <AddTodo
      onAddClick={text =>
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text
        })
      }
    />
    {/*  This top-level component acts as a container component (rather than Todo, which is presentational) */}
    <TodoList
      todos={
        getVisibleTodos(
          todos,
          visibilityFilter
        )
      }
      onTodoClick={id =>
        store.dispatch({
          type: 'TOGGLE_TODO',
          id
        })
      } />
    <Footer
      visibilityFilter={visibilityFilter}
      onFilterClick={ filter =>
        store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter
        })
      } />
  </div>
)

const render = () => {
  ReactDOM.render(
    <TodoApp {...store.getState()} />,
    document.getElementById('root')
  )
};

store.subscribe(render); // any time the store's state changes, render is called
render();