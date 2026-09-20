import { useEffect, useState } from 'react'
import { apiRequest } from './api/api'

function Groups({ onGroupsChange, onOpenGroup }) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creating, setCreating] = useState(false)

  async function fetchGroups() {
    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/groups')

      setGroups(data.groups)
      onGroupsChange(data.groups.length)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  async function handleCreateGroup(e) {
    e.preventDefault()

    if (groupName.trim() === '') {
      setError('Please enter a group name')
      return
    }

    try {
      setCreating(true)
      setError('')

      const data = await apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: groupName.trim(),
        }),
      })

      const newGroup = data.group

      const updatedGroups = [...groups, newGroup]

      setGroups(updatedGroups)
      onGroupsChange(updatedGroups.length)

      setGroupName('')
      setShowCreate(false)
    } catch (error) {
      setError(error.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="dashboard-section">

      <div className="section-header">
        <div>
          <h2>Your Groups</h2>
          <p>Manage your shared expenses.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowCreate(true)}
        >
          + Create Group
        </button>
      </div>

      {error && (
        <p className="groups-error">
          {error}
        </p>
      )}

      {loading ? (
        <div className="groups-loading">
          Loading your groups...
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-groups">

          <div className="empty-icon">👥</div>

          <h3>No groups yet</h3>

          <p>
            Create your first group and start splitting
            expenses with your friends.
          </p>

          <button
            className="primary-button"
            onClick={() => setShowCreate(true)}
          >
            Create Your First Group
          </button>

        </div>
      ) : (
        <div className="groups-grid">

          {groups.map((group) => (
            <div className="group-card" key={group._id}>

              <div className="group-card-top">
                <div className="group-icon">
                  {group.name.charAt(0).toUpperCase()}
                </div>

                <button className="group-menu">
                  •••
                </button>
              </div>

              <h3>{group.name}</h3>

              <p>
                {group.members.length}{' '}
                {group.members.length === 1
                  ? 'member'
                  : 'members'}
              </p>

              <button
                className="view-group-button"
                onClick={() => onOpenGroup(group._id)}
              >
                Open Group →
            </button>

            </div>
          ))}

        </div>
      )}

      {showCreate && (
        <div className="modal-overlay">

          <div className="create-group-modal">

            <button
              className="modal-close"
              onClick={() => {
                setShowCreate(false)
                setGroupName('')
                setError('')
              }}
            >
              ×
            </button>

            <div className="modal-icon">
              +
            </div>

            <h2>Create a group</h2>

            <p>
              Create a group to start sharing expenses.
            </p>

            <form onSubmit={handleCreateGroup}>

              <label>Group name</label>

              <input
                type="text"
                placeholder="e.g. Goa Trip"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />

              <button
                type="submit"
                className="auth-submit"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>

            </form>

          </div>

        </div>
      )}

    </section>
  )
}

export default Groups