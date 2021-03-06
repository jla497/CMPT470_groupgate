import React, { Component } from 'react'
import Group from './Group'
import { Button } from "semantic-ui-react";
import axios from 'axios';

const userId = '5ab60109351f8a12ba4937b2';    // you have to update this user ID with id from your backend

const BASE_URL = 'http://localhost:3000';
const url= `${BASE_URL}/api/groupinfos`;
export default class ProjectGroup extends Component {
	constructor(props){
    super(props);
    this.state = {
			userId: this.props.userId,
			adding: false,
			groups: [],
			addButtonDisabled: false
    }
		this.add = this.add.bind(this)
		this.eachGroup = this.eachGroup.bind(this)
		this.update = this.update.bind(this)
		this.remove = this.remove.bind(this)
		this.nextId = this.nextId.bind(this)
		this.onCancel = this.onCancel.bind(this)
		this.getGroups = this.getGroups.bind(this)
	}

	componentDidMount() {
    this.getGroups();
  }

	getGroups(){
		console.log("GL-> myGroups: ", this.props.myGroups)

		if(this.props.myGroups){																											// if props. flag = true, get my groups
			console.log ("GL -> I should be gettig users groups now")
			axios.get(`${url}?filter={"where":{"group_owner":{"like":"${this.props.userId}"}}}`)
			.then(response => {
				this.setState( {
					groups: response.data,
					}, () => {
					console.log(this.state);
				})
			})
		}
		else{
			console.log ("GL -> I should be gettig groups now")
			axios.get(`${url}?filter={"where":{"group_owner":{"neq":"${this.props.userId}"}}}`)
			.then(response => {
				this.setState( {groups: response.data}, () => {
				console.log(this.state)
				})
			})
		}
  }


	add(text) {
		this.setState(prevState => ({
			groups: [
				...prevState.groups,
				{
						id: this.nextId(),
						group_name: text,
						group_course: text,
	          group_status: "Open",
	          group_descr: text,
						group_members: []
					}
				],
			}))
			this.setState({adding: true})
			this.setState({ addButtonDisabled: true })
		}

		nextId() {
			this.uniqueId = this.uniqueId || 0
			return this.uniqueId++
		}

		update(newGroupName, newCourseNumber, newStatus, newDescription, i, addMode) {
			console.log('GL -> Add mode: ', addMode)
			if ( addMode ){
				console.log("GL -> ")
				axios.request({																														//Add group
					method:'post',
					url:`http://localhost:3000/api/groupinfos/`,
					data: {
						group_name: newGroupName,
						group_descr: newDescription,
						group_status: newStatus,
						group_course: newCourseNumber,
						group_url: "",
						group_gitlink: "",
						group_owner: this.state.userId,
						group_members: []
					}
				}).then(response => {
					console.log( response )
				}).catch(err => console.log(err));

			}else {
				axios.request({																														// update group
					method:'patch',
					url:`http://localhost:3000/api/groupinfos/${i}`,
					data: {
						group_name: newGroupName,
						group_descr: newDescription,
						group_status: newStatus,
						group_course: newCourseNumber																				// items will need to be udpated when adding/removing members enabled
					}
				}).then(response => {
				}).catch(err => console.log(err));
			}

			this.setState(prevState => ({
				groups: prevState.groups.map(
					group => (group.id !== i) ? group : {...group, group_name: newGroupName, group_course: newCourseNumber, group_status: newStatus, group_descr: newDescription}
				)
			}))

			this.setState({ addButtonDisabled: false })
		}

		onCancel( newState ){
			this.setState({ addButtonDisabled: newState })
		}

		remove(id) {
			console.log('removing item at', id)																					// DEBUG
			axios.delete(`http://localhost:3000/api/groupinfos/${id}`)
				.then(response => {
					this.setState( {
						}, () => {
						console.log('MP -> Loading user: ', this.state);
					})
			})

			this.setState(prevState => ({
				groups: prevState.groups.filter(group => group.id !== id)
			}))
		}

		eachGroup(group, i) {
			console.log("GL -> goup members at i: ", i,  group.group_members)
			return (
				<Group key={group.id}
					  index={group.id} groupName={group.group_name} courseNumber={group.group_course} status={group.group_status}
						description= {group.group_descr} members={group.group_members} adding={this.state.adding}
						onCancel={this.onCancel} onChange={this.update} onRemove={this.remove} myGroups={this.props.myGroups}>
			  </Group>
			)
		}

		render() {
			return (
				<div className="board">
				<Button basic color="blue" onClick={this.add.bind(null,"")} id="add"
								disabled={this.state.addButtonDisabled}>+ New Group</Button>
					{this.state.groups.map(this.eachGroup)}
				</div>
			)
		}
	}
