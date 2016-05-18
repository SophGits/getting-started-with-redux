import deepFreeze from 'deep-freeze';
import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';

// This code is the same as the completed video (23):
// https://egghead.io/lessons/javascript-redux-extracting-container-components-visibletodolist-addtodo

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

// presentational component
const Link = ({
  active,
  children,
  onClick
}) => {
  if(active) {
    return <span>{children}</span>;
  }

  return (
    <a href='#'
      onClick={e => {
        e.preventDefault();
        onClick()
      }}
    >
      {children}
    </a>
  )
}

// container component
class FilterLink extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    );
    {/* any time the store's state ∆s we update the component */}
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const state = store.getState();
    {/* not React's state, but the Redux store's state */}

    {/* Below: necessary to use the current state of the store in the render method, hence why we subscribe to the store, above. Now when the link is clicked (below) it changes the store, and everything subscribed to the store updates. */}

    {/* NB the props.filter is what's passed down from Footer */}
    return (
      <Link active = {
        props.filter === state.visibilityFilter
      }
      onClick= {() =>
        store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter: props.filter
        })
      }
      >
        {props.children}
      </Link>
    )
  }
}

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'
    >
      All
    </FilterLink>

    {', '}
    <FilterLink
      filter='SHOW_ACTIVE'
    >
      Active
    </FilterLink>

    {', '}
    <FilterLink
      filter='SHOW_COMPLETED'
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

let nextTodoId = 0;
const AddTodo = () => {
  let input;

  return (
    <div>
      <input ref={node => {
        input = node;
      }} />
      <button onClick={() => {
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        })
          input.value = '';
        }}>
        Add Todo
      </button>
    </div>
  )
}

class VisibleTodoList extends Component {

  componentDidMount() {
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const props = this.props;
    const state = store.getState();

    return (
      <TodoList
        todos={
          getVisibleTodos(
            state.todos,
            state.visibilityFilter
          )
        }
        onTodoClick={id =>
          store.dispatch({
            type: 'TOGGLE_TODO',
            id
          })
        } />
    )
  }
}

const TodoApp = () =>
(
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)


ReactDOM.render(
  <TodoApp />,
  document.getElementById('root')
);