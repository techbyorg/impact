// TODO: settings page might be better in frontend-shared
import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $icon from 'frontend-shared/components/icon'
import { editIconPath } from 'frontend-shared/components/icon/paths'
import $table from 'frontend-shared/components/table'
import $tags from 'frontend-shared/components/tags'

import $inviteOrgUserDialog from '../invite_org_user_dialog'
import $editOrgUserDialog from '../edit_org_user_dialog'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $settings () {
  const { lang, model } = useContext(context)

  const {
    isInviteOrgUserDialogVisibleStream, editingOrgUserStream,
    orgUsersStream, orgUserInvitesStream
  } = useMemo(() => {
    return {
      isInviteOrgUserDialogVisibleStream: new Rx.BehaviorSubject(false),
      editingOrgUserStream: new Rx.BehaviorSubject(null),
      orgUsersStream: model.orgUser.getAll(),
      orgUserInvitesStream: model.orgUserInvite.getAll()
    }
  }, [])

  const {
    isInviteOrgUserDialogVisible, editingOrgUser, orgUsers, orgUserInvites
  } = useStream(() => ({
    isInviteOrgUserDialogVisible: isInviteOrgUserDialogVisibleStream,
    editingOrgUser: editingOrgUserStream,
    orgUsers: orgUsersStream,
    orgUserInvites: orgUserInvitesStream
  }))

  console.log('orgusers', orgUsers, orgUserInvites, editingOrgUser)

  return z('.z-org-users',
    z('.top', [
      z('.left', [
        z('.title', lang.get('general.users')),
        z('.description', lang.get('orgUsers.description'))
      ]),
      z('.right',
        z('.invite-button', [
          z($button, {
            isFullWidth: false,
            // isBgColor: true,
            isBgColor: true,
            text: lang.get('general.invite'),
            onclick: () => {
              isInviteOrgUserDialogVisibleStream.next(true)
            }
          })
        ])
      )
    ]),
    z($table, {
      data: orgUsers?.nodes,
      columns: [
        {
          key: 'user',
          name: lang.get('general.user'),
          width: 200,
          content ({ row }) {
            return row.user.name
          }
        },
        {
          key: 'email',
          name: lang.get('general.email'),
          width: 250,
          content ({ row }) {
            return row.user.email
          }
        },
        {
          key: 'roles',
          name: lang.get('general.roles'),
          width: 300,
          content ({ row }) {
            return z($tags, {
              maxVisibleCount: 3,
              tags: _.map(row.roles.nodes, ({ name }) => ({ text: name }))
            })
          }
        },
        {
          key: 'partner',
          name: lang.get('general.partner'),
          width: 300,
          content ({ row }) {
            return z($tags, {
              maxVisibleCount: 3,
              tags: _.map(row.partners?.nodes, ({ name }) => ({ text: name }))
            })
          }
        },
        {
          key: 'edit',
          name: '',
          width: 50,
          content ({ row }) {
            return z($icon, {
              icon: editIconPath,
              onclick: () => {
                console.log('click')
                editingOrgUserStream.next(row)
              }
            })
          }
        }
      ]
    }),
    z('.top', [
      z('.left', [
        z('.title', lang.get('orgUsers.invitedUsers'))
      ])
    ]),
    z($table, {
      data: orgUserInvites?.nodes,
      columns: [
        {
          key: 'email',
          name: lang.get('general.email'),
          width: 250,
          content ({ row }) {
            return row.email
          }
        },
        {
          key: 'roles',
          name: lang.get('general.roles'),
          width: 300,
          content ({ row }) {
            return z($tags, {
              maxVisibleCount: 3,
              tags: _.map(row.roles.nodes, ({ name }) => ({ text: name }))
            })
          }
        },
        {
          key: 'partner',
          name: lang.get('general.partner'),
          width: 300,
          content ({ row }) {
            return z($tags, {
              maxVisibleCount: 3,
              tags: _.map(row.partners?.nodes, ({ name }) => ({ text: name }))
            })
          }
        },
        {
          key: 'edit',
          name: '',
          width: 50,
          content ({ row }) {
            return z($icon, {
              icon: editIconPath,
              onclick: () => {
                console.log('click')
                editingOrgUserStream.next(row)
              }
            })
          }
        }
      ]
    }),
    isInviteOrgUserDialogVisible && z($inviteOrgUserDialog, {
      onClose: () => isInviteOrgUserDialogVisibleStream.next(false)
    }),
    editingOrgUser && z($editOrgUserDialog, {
      orgUser: editingOrgUser,
      onClose: () => editingOrgUserStream.next(false)
    })
  )
}
