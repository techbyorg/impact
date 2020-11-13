import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $avatar from 'frontend-shared/components/avatar'
import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $icon from 'frontend-shared/components/icon'
import { copyIconPath } from 'frontend-shared/components/icon/paths'
import $input from 'frontend-shared/components/input'
import $dropdownMultiple from 'frontend-shared/components/dropdown_multiple'

import config from '../../config'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $inviteOrgUserDialog ({ orgUserInvite, onClose }) {
  const { lang, model } = useContext(context)

  const {
    partnerIdsStreams, roleIdsStreams, partnerOptionsStream, roleOptionsStream,
    inviteLinkStream, emailStream
  } = useMemo(() => {
    const allPartnersStreams = model.partner.getAll()
    const allRolesStreams = model.role.getAll()

    const partnerIdsStreams = new Rx.ReplaySubject(1)
    partnerIdsStreams.next(Rx.of(orgUserInvite?.partnerIds))

    const roleIdsStreams = new Rx.ReplaySubject(1)
    roleIdsStreams.next(Rx.of(orgUserInvite?.roleIds))

    const partnerOptionsStream = allPartnersStreams.pipe(rx.map((allPartners) => {
      return _.map(allPartners.nodes, (partner) => ({
        value: partner.id, text: partner.name
      }))
    }))

    const roleOptionsStream = allRolesStreams.pipe(rx.map((allRoles) => {
      return _.map(allRoles.nodes, (role) => ({
        value: role.id, text: role.name
      }))
    }))

    return {
      partnerIdsStreams,
      roleIdsStreams,
      partnerOptionsStream,
      roleOptionsStream,
      inviteLinkStream: new Rx.BehaviorSubject(`${config.HOST}/invite`),
      emailStream: new Rx.BehaviorSubject('')
    }
  }, [])

  const { email, partnerIds, roleIds } = useStream(() => ({
    email: emailStream,
    partnerIds: partnerIdsStreams.pipe(rx.switchAll()),
    roleIds: roleIdsStreams.pipe(rx.switchAll())
  }))

  console.log('orgUserInvite', email, orgUserInvite)

  const inviteOrgUser = async () => {
    await model.orgUserInvite.upsert({
      id: orgUserInvite?.id,
      email,
      partnerIds,
      roleIds
    })
    onClose()
  }

  return z('.z-invite-org-user-dialog', [
    z($dialog, {
      onClose,
      isWide: true,
      $title: lang.get('inviteOrgUserDialog.title'),
      $content:
        z('.z-invite-org-user-dialog_content', [
          z('.description',
            lang.get('inviteOrgUserDialog.partnersDescription')
          ),
          z('.section', z($dropdownMultiple, {
            placeholder: lang.get('partnerPicker.placeholder'),
            isFullWidth: true,
            valuesStreams: partnerIdsStreams,
            optionsStream: partnerOptionsStream
          })),
          z('.description',
            lang.get('inviteOrgUserDialog.rolesDescription')
          ),
          z('.section', z($dropdownMultiple, {
            placeholder: lang.get('rolePicker.placeholder'),
            isFullWidth: true,
            valuesStreams: roleIdsStreams,
            optionsStream: roleOptionsStream
          })),
          z('.email', [
            z('.title',
              lang.get('inviteOrgUserDialog.inviteEmailTitle')
            ),
            z('.input', z($input, {
              placeholder: lang.get('general.email'),
              valueStream: emailStream
            })),
            z('.action',
              z($avatar, { user: { name: email } }),
              z('.value', email),
              z('.button',
                z($button, {
                  text: lang.get('general.invite'),
                  isPrimary: true,
                  isFullWidth: false,
                  onclick: inviteOrgUser,
                  shouldHandleLoading: true
                })
              )
            )
          ]),
          z('.divider'),
          z('.invite-link', [
            z('.title',
              lang.get('inviteOrgUserDialog.inviteLinkTitle')
            ),
            z('.row', [
              z('.input#invite-link', z($input, {
                valueStream: inviteLinkStream,
                disabled: true,
                onclick: (e) => e.target.select()
              })),
              z('.icon', z($icon, {
                icon: copyIconPath,
                isCircled: true,
                onclick: () => {
                  document.querySelector('#invite-link input').select()
                  document.execCommand('copy')
                }
              }))
            ])
          ])
        ])
    })
  ])
};
