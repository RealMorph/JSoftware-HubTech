import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactQuery } from '../core/hooks/useContactQuery';
import { Contact } from '../core/types/contact';
import { 
  Box, 
  Button, 
  Card, 
  CircularProgress, 
  Container, 
  Divider, 
  Grid, 
  IconButton, 
  InputAdornment, 
  Menu, 
  MenuItem, 
  TextField, 
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

// Define all possible status types to avoid type comparison issues
type ContactStatus = 'lead' | 'opportunity' | 'customer' | 'inactive' | 'all';

const ContactsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { useContacts, useSearchContacts, useDeleteContact } = useContactQuery();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<ContactStatus>('all');
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  
  // Menu state for each contact
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  
  // Query for contacts based on filters
  const { data: contacts = [], isLoading, error, refetch } = useContacts();
  
  // Query for search results
  const { 
    data: searchResults = [], 
    isLoading: isSearching 
  } = useSearchContacts(searchQuery, searchQuery.length > 0);
  
  // Mutation for deleting contacts
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();
  
  // Filtered and/or searched contacts
  const displayedContacts = searchQuery.length > 0 
    ? searchResults 
    : statusFilter === 'all' 
      ? contacts 
      : contacts.filter(contact => contact.status === statusFilter);
  
  // Filter menu handlers
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleFilterSelect = (status: ContactStatus) => {
    setStatusFilter(status);
    handleFilterClose();
  };
  
  // Contact menu handlers
  const handleContactMenuOpen = (contactId: string, event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl({ ...menuAnchorEl, [contactId]: event.currentTarget });
  };
  
  const handleContactMenuClose = (contactId: string) => {
    setMenuAnchorEl({ ...menuAnchorEl, [contactId]: null });
  };
  
  // Delete dialog handlers
  const handleDeleteDialogOpen = (contactId: string) => {
    setDeleteContactId(contactId);
    handleContactMenuClose(contactId);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteContactId(null);
  };
  
  const handleDeleteContact = () => {
    if (deleteContactId) {
      deleteContact(deleteContactId, {
        onSuccess: () => {
          handleDeleteDialogClose();
        }
      });
    }
  };
  
  // Render contact card
  const renderContactCard = (contact: Contact) => {
    return (
      <Card key={contact.id} sx={{ p: 2, mb: 2, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            aria-label="more"
            onClick={(e: React.MouseEvent<HTMLElement>) => handleContactMenuOpen(contact.id, e)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl[contact.id]}
            open={Boolean(menuAnchorEl[contact.id])}
            onClose={() => handleContactMenuClose(contact.id)}
          >
            <MenuItem onClick={() => navigate(`/contacts/${contact.id}`)}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={() => handleDeleteDialogOpen(contact.id)}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {contact.firstName} {contact.lastName}
            </Typography>
            
            <Chip 
              label={contact.status || 'Lead'} 
              size="small" 
              color={
                contact.status === 'customer' ? 'success' : 
                contact.status === 'opportunity' ? 'primary' : 
                'default'
              }
              sx={{ mb: 1 }}
            />
            
            {contact.company && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {contact.company}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Grid container spacing={2}>
          {contact.email && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{contact.email}</Typography>
              </Box>
            </Grid>
          )}
          
          {contact.phone && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{contact.phone}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {contact.tags && contact.tags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {contact.tags.map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }} 
              />
            ))}
          </Box>
        )}
      </Card>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Contacts</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/contacts/new')}
        >
          Add Contact
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', mb: 3 }}>
        <TextField
          placeholder="Search contacts..."
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2 }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={handleFilterClick}
        >
          Filter
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem selected={statusFilter === 'all'} onClick={() => handleFilterSelect('all')}>
            All
          </MenuItem>
          <MenuItem selected={statusFilter === 'lead'} onClick={() => handleFilterSelect('lead')}>
            Leads
          </MenuItem>
          <MenuItem selected={statusFilter === 'opportunity'} onClick={() => handleFilterSelect('opportunity')}>
            Opportunities
          </MenuItem>
          <MenuItem selected={statusFilter === 'customer'} onClick={() => handleFilterSelect('customer')}>
            Customers
          </MenuItem>
        </Menu>
      </Box>
      
      {isLoading || isSearching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error">Error loading contacts</Typography>
          <Button variant="outlined" onClick={() => refetch()} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      ) : displayedContacts.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>No contacts found</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/contacts/new')}
            sx={{ mt: 2 }}
          >
            Add Your First Contact
          </Button>
        </Box>
      ) : (
        <Box>
          {displayedContacts.map(renderContactCard)}
        </Box>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteContactId !== null}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this contact? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteContact} 
            color="error" 
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactsListPage; 