import { SOURCE_CODE_URL, PROCUREMENT_CONCIERGE_URL } from 'front-end/config';
import { CONTACT_EMAIL } from 'shared/config';
import { prefixPath } from 'front-end/lib';
import { View } from 'front-end/lib/framework';
import Link, { AnchorProps, externalDest, iconLinkSymbol, leftPlacement, rightPlacement, routeDest, emailDest } from 'front-end/lib/views/link';
import Separator from 'front-end/lib/views/separator';
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { adt } from 'shared/lib/types';
import i18next from 'i18next'

const links: AnchorProps[] = [
  {
    children: i18next.t('links.home'),
    dest: routeDest(adt('landing', null))
  },
  {
    children:  i18next.t('links.about'),
    dest: routeDest(adt('contentView', 'about'))
  },
  {
    children: i18next.t('links.disclaimer'),
    dest: routeDest(adt('contentView', 'disclaimer'))
  },
  {
    children: i18next.t('links.privacy'),
    dest: routeDest(adt('contentView', 'privacy'))
  },
  {
    children: i18next.t('links.accessibility'),
    dest: routeDest(adt('contentView', 'accessibility'))
  },
  {
    children: i18next.t('links.copyright'),
    dest: routeDest(adt('contentView', 'copyright'))
  },
  {
    children: i18next.t('links.contact-us'),
    dest: emailDest([CONTACT_EMAIL])
  },
  {
    children: i18next.t('links.source-code'),
    dest: externalDest(SOURCE_CODE_URL),
    newTab: true,
    symbol_: leftPlacement(iconLinkSymbol('github'))
  },
  {
    children: i18next.t('conciergerieApprovisionnement'),
    dest: externalDest(PROCUREMENT_CONCIERGE_URL),
    newTab: true,
    symbol_: rightPlacement(iconLinkSymbol('external-link'))
  }
];

const Footer: View<{}> = () => {
  return (
    <footer className='w-100 d-print-none bg-white'>
      <div className="footer-top-bar">
      <Container className='w-100'>
        <Row className=" mb-4 mt-4">
          <Col xs='12' className='d-flex flex-row flex-wrap pt-3'>
            <div className='flex-grow-1'>
            
            </div>
            <div className='flex-shrink-0 mr-5'>
              <div className='mb-2'><Link className="font-size-large roboto" color='white'>{i18next.t('links.contact-us')}</Link></div>
              <ul className='footer-link-list'>
                <li><a href="#">{i18next.t('links.phone')}</a></li>
                <li><a target="_blank" href="/bureaux-de-services/">{i18next.t('links.serviceOffices')}&nbsp;</a></li>
                <li><a href="/nous-joindre/courriel/">{i18next.t('links.mail')}&nbsp;</a></li>
                <li><a href="mailto:info@quebec.ca?subject=Problèmes%20techniques%20reliés%20à%20la%20plateforme">{i18next.t('links.TechnicalProblems')}</a></li>
              </ul>
            </div>
            <div className='flex-shrink-0 mr-4'>
              <div className='footer-social-list-title font-size-large text-white mb-2'>{i18next.t('links.follow-us')}</div>
              <ul className="d-flex footer-social-list">
                <li>
                  <a target="_blank" href="https://www.facebook.com/GouvQc/">
                    <img alt="Facebook pictogramme" src={prefixPath('/images/facebook.svg')} width="97" height="97" />
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://twitter.com/gouvqc">
                    <img alt="Twitter pictogramme" src={prefixPath('/images/Twitter.svg')} width="97" height="97" />
                  </a>
                </li>
                <li>
                  <a target="_blank" href="https://www.youtube.com/channel/UCgi4UW4SNeYNl4n-AEvgKoQ/featured">
                    <img alt="YouTube pictogramme" src={prefixPath('/images/Youtube.svg')} width="97" height="68" />
                  </a>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
      </div>
      <Container>  
        <Row className="mb-3">
          <Col xs='12' className='text-center pt-3'>
            {links.map((link, i) => (
              <span key={`footer-link-${i}`} className='mb-3'>
                <Link {...link} className='o-75 font-size-extra-small' color='primary' button={false} />
                {i < links.length - 1
                  ? (<Separator spacing='4' color='white'>|</Separator>)
                  : null}
              </span>
            ))}
          </Col>
        </Row>
        <Row className="mb-1">
          <Col className='text-center'>
            <img src={prefixPath('/images/quebec_logo_pied_page.svg')} alt='Québec' style={{ 'height': '35px' }}/>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col className='text-center'>
            <a className="font-size-extra-small" href="http://www.droitauteur.gouv.qc.ca/copyright.php" target="_self">© Gouvernement du Québec,&nbsp;2020</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
