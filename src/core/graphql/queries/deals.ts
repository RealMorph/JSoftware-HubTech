import { gql } from 'graphql-tag';

export const GET_DEALS = gql`
  query GetDeals {
    deals {
      id
      name
      description
      stage
      amount
      currency
      probability
      priority
      contactId
      expectedCloseDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_DEAL = gql`
  query GetDeal($id: ID!) {
    deal(id: $id) {
      id
      name
      description
      stage
      amount
      currency
      probability
      priority
      expectedCloseDate
      actualCloseDate
      contactId
      createdAt
      updatedAt
      tags
      customFields
    }
  }
`;

export const GET_DEAL_BY_STAGE = gql`
  query GetDealsByStage($stage: DealStage!) {
    dealsByStage(stage: $stage) {
      id
      name
      amount
      currency
      probability
      stage
      contactId
      expectedCloseDate
      updatedAt
    }
  }
`;

export const GET_DEALS_BY_CONTACT = gql`
  query GetDealsByContact($contactId: ID!) {
    dealsByContact(contactId: $contactId) {
      id
      name
      amount
      currency
      stage
      priority
      expectedCloseDate
      updatedAt
    }
  }
`;

export const CREATE_DEAL = gql`
  mutation CreateDeal($input: CreateDealInput!) {
    createDeal(input: $input) {
      id
      name
      description
      stage
      amount
      currency
      contactId
      createdAt
    }
  }
`;

export const UPDATE_DEAL = gql`
  mutation UpdateDeal($id: ID!, $input: UpdateDealInput!) {
    updateDeal(id: $id, input: $input) {
      id
      name
      description
      stage
      amount
      currency
      probability
      contactId
      updatedAt
    }
  }
`;

export const DELETE_DEAL = gql`
  mutation DeleteDeal($id: ID!) {
    deleteDeal(id: $id) {
      success
      message
    }
  }
`;

export const GET_DEAL_ACTIVITIES = gql`
  query GetDealActivities($dealId: ID!) {
    dealActivities(dealId: $dealId) {
      id
      dealId
      userId
      type
      title
      description
      previousValue
      newValue
      timestamp
    }
  }
`;

export const GET_DEAL_TASKS = gql`
  query GetDealTasks($dealId: ID!) {
    dealTasks(dealId: $dealId) {
      id
      dealId
      assignedTo
      title
      description
      dueDate
      isCompleted
      completedAt
      priority
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_DEAL_TASK = gql`
  mutation CreateDealTask($input: CreateDealTaskInput!) {
    createDealTask(input: $input) {
      id
      title
      description
      dueDate
      priority
      createdAt
    }
  }
`; 