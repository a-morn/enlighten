export default `
	interface MutationResponse {
		code: String!
		success: Boolean!
		message: String!
	}

	interface SubscriptionPayload {
		"Create/Delete/Update"
		mutation: String!
	}

	type Question {
		id: ID!
		type: String!
		alternatives: [QuestionAlternative!]
		text: String!
		src: String	
		answerId: ID
	} 

	type QuestionAlternative {
		type: String!
		text: String
		src: String
		id: ID!
	}

	type Query {
		_empty: String
	}

	type Mutation {
		_empty: String
	}

	type Subscription {
		_empty: String
	}
`
