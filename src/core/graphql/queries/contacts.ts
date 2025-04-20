import { gql } from 'graphql-tag';

export const GET_CONTACTS = gql`
  query GetContacts {
    contacts {
      id
      firstName
      lastName
      email
      phone
      company {
        name
      }
      status
      tags
      lastContacted
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONTACT = gql`
  query GetContact($id: ID!) {
    contact(id: $id) {
      id
      firstName
      lastName
      email
      phone
      company {
        id
        name
        website
        industry
        size
        notes
      }
      jobTitle
      address {
        street
        city
        state
        zipCode
        country
      }
      tags
      links {
        platform
        url
      }
      notes
      status
      source
      lastContacted
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_CONTACT = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      id
      firstName
      lastName
      email
      status
      createdAt
    }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
    updateContact(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      phone
      status
      updatedAt
    }
  }
`;

export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id) {
      success
      message
    }
  }
`;

export const GET_CONTACT_ACTIVITIES = gql`
  query GetContactActivities($contactId: ID!) {
    contactActivities(contactId: $contactId) {
      id
      contactId
      userId
      type
      title
      description
      timestamp
      metadata
    }
  }
`;

export const ADD_CONTACT_ACTIVITY = gql`
  mutation AddContactActivity($input: CreateContactActivityInput!) {
    addContactActivity(input: $input) {
      id
      contactId
      type
      title
      description
      timestamp
    }
  }
`; 